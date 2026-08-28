'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'historias-clientes'

const EXTENSION_BY_MIME_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

async function uploadPhotos(supabase, formData) {
  const files = formData.getAll('fotos_nuevas').filter((f) => f instanceof File && f.size > 0)
  if (files.length === 0) return []

  const urls = []
  for (const file of files) {
    const ext = EXTENSION_BY_MIME_TYPE[file.type]
    if (!ext) {
      throw new Error(
        `"${file.name}" no es una imagen soportada (usá JPG, PNG, WEBP, GIF o AVIF).`,
      )
    }

    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })
    if (error) throw new Error(`Error al subir una foto: ${error.message}`)

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return urls
}

async function deletePhotos(supabase, urlsToDelete) {
  if (!urlsToDelete.length) return

  const paths = urlsToDelete
    .map((url) => {
      const marker = `/object/public/${BUCKET}/`
      return url.split(marker)[1]
    })
    .filter(Boolean)

  if (paths.length === 0) return

  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw new Error(`Error al borrar una foto: ${error.message}`)
}

// Reemplaza el set completo de historias por el que armó el usuario en el
// panel (mismo patrón que el "orden" de fotos de un vehículo: viaja como
// JSON con entradas 'existing' | 'new').
export async function saveHistorias(formData) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('historias_clientes')
    .select('items')
    .eq('id', 1)
    .maybeSingle()

  const itemsOriginales = existing?.items || []

  const nuevasFotosUrls = await uploadPhotos(supabase, formData)

  const ordenRaw = formData.get('orden')
  let orden = []
  try {
    orden = JSON.parse(ordenRaw?.toString() || '[]')
  } catch {
    orden = []
  }

  const itemsFinal = orden
    .map((entry) => {
      if (entry.type === 'existing') return { url: entry.url, es_video: !!entry.es_video }
      const url = nuevasFotosUrls[entry.index]
      return url ? { url, es_video: !!entry.es_video } : null
    })
    .filter(Boolean)

  // Cualquier foto que estaba antes y ya no quedó en el set final se borra
  // del bucket para no dejar archivos huérfanos.
  const urlsFinales = itemsFinal.map((i) => i.url)
  const fotosABorrar = itemsOriginales
    .map((i) => i.url)
    .filter((url) => !urlsFinales.includes(url))
  await deletePhotos(supabase, fotosABorrar)

  const { error } = await supabase
    .from('historias_clientes')
    .upsert({ id: 1, items: itemsFinal })
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
}
