'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'vehiculos-fotos'

// Junta y castea los datos del formulario a los tipos que espera la tabla
// `vehiculos` (anio y km son integer, destacado es boolean, el resto texto).
function parseFormData(formData) {
  const anio = Number(formData.get('anio'))
  const km = Number(formData.get('km')) || 0

  if (!Number.isInteger(anio)) {
    throw new Error('El año tiene que ser un número válido.')
  }

  const tipoInput = formData.get('tipo')?.toString()
  const tipo = km === 0 ? '0km' : (tipoInput || 'Usado')

  return {
    marca: formData.get('marca')?.toString().trim(),
    modelo: formData.get('modelo')?.toString().trim(),
    anio,
    km,
    precio: formData.get('precio')?.toString().trim(),
    tipo,
    combustible: formData.get('combustible')?.toString(),
    transmision: formData.get('transmision')?.toString(),
    color: formData.get('color')?.toString().trim() || null,
    disponibilidad: formData.get('disponibilidad')?.toString(),
    destacado: formData.get('destacado') === 'on',
  }
}

// Sube las fotos nuevas seleccionadas en el formulario (campo
// "fotos_nuevas") al bucket de Storage, dentro de una carpeta por auto
// (carpeta = vehicleId). Devuelve las URLs públicas en el mismo orden en
// que llegaron, para poder mapearlas de vuelta al orden elegido en el form.

// Mapea el tipo MIME real del archivo (no el nombre, que puede venir sin
// extensión o con una que no corresponde) a una extensión de archivo.
const EXTENSION_BY_MIME_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

async function uploadPhotos(supabase, vehicleId, formData) {
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

    const path = `${vehicleId}/${crypto.randomUUID()}.${ext}`

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

// Borra del bucket las fotos cuyas URLs quedaron afuera del array final
// (porque el usuario las sacó de la grilla antes de guardar).
async function deletePhotos(supabase, urlsToDelete) {
  if (!urlsToDelete.length) return

  const paths = urlsToDelete.map((url) => {
    const marker = `/object/public/${BUCKET}/`
    return url.split(marker)[1]
  }).filter(Boolean)

  if (paths.length === 0) return

  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw new Error(`Error al borrar una foto: ${error.message}`)
}

// Reconstruye el array final de imágenes en el orden exacto que se armó
// en la grilla del formulario (VehicleForm), combinando fotos que ya
// estaban subidas con las recién subidas en esta misma acción.
//
// El campo "orden" viaja como JSON: una lista de
//   { type: 'existing', url }               -> ya estaba en Storage
//   { type: 'new', index }                  -> es la N-ésima de "fotos_nuevas"
// en el orden final elegido por el usuario (la primera = portada).
function buildOrderedImages(formData, nuevasFotosUrls) {
  const ordenRaw = formData.get('orden')

  if (!ordenRaw) {
    // No debería pasar (el form siempre lo manda), pero por las dudas no
    // perdemos fotos si llegara a faltar.
    return nuevasFotosUrls
  }

  let orden
  try {
    orden = JSON.parse(ordenRaw.toString())
  } catch {
    return nuevasFotosUrls
  }

  return orden
    .map((entry) => (entry.type === 'existing' ? entry.url : nuevasFotosUrls[entry.index]))
    .filter(Boolean)
}

export async function createVehicle(formData) {
  const supabase = await createClient()
  const data = parseFormData(formData)

  // Insertamos primero sin fotos para conseguir el id (las fotos se
  // guardan en una carpeta con ese id dentro del bucket).
  const { data: created, error } = await supabase
    .from('vehiculos')
    .insert(data)
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  const nuevasFotosUrls = await uploadPhotos(supabase, created.id, formData)
  const imagenes = buildOrderedImages(formData, nuevasFotosUrls)

  if (imagenes.length > 0) {
    const { error: updateError } = await supabase
      .from('vehiculos')
      .update({ imagenes })
      .eq('id', created.id)
    if (updateError) throw new Error(updateError.message)
  }

  revalidatePath('/', 'layout')
}

export async function updateVehicle(id, formData) {
  const supabase = await createClient()
  const data = parseFormData(formData)

  const { data: existing } = await supabase
    .from('vehiculos')
    .select('imagenes')
    .eq('id', id)
    .single()

  const imagenesOriginales = existing?.imagenes || []

  const nuevasFotosUrls = await uploadPhotos(supabase, id, formData)
  const imagenesFinal = buildOrderedImages(formData, nuevasFotosUrls)

  // Cualquier foto que estaba antes y no quedó en el orden final (porque
  // el usuario la sacó de la grilla) se borra del bucket.
  const fotosABorrar = imagenesOriginales.filter((url) => !imagenesFinal.includes(url))
  await deletePhotos(supabase, fotosABorrar)

  const { error } = await supabase
    .from('vehiculos')
    .update({ ...data, imagenes: imagenesFinal })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
}

export async function deleteVehicle(id) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('vehiculos')
    .select('imagenes')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('vehiculos').delete().eq('id', id)
  if (error) throw new Error(error.message)

  // Borramos las fotos del auto después de borrar la fila, para no dejar
  // archivos huérfanos en el bucket.
  if (existing?.imagenes?.length) {
    await deletePhotos(supabase, existing.imagenes)
  }

  revalidatePath('/', 'layout')
}
