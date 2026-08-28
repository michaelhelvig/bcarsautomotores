import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateCoverImageBuffer } from '@/lib/instagram/coverImage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Ruta de diagnóstico, SOLO para uso manual desde el panel (protegida con
// la misma sesión de Supabase que /panel): permite generar y ver la
// portada de Instagram de un vehículo puntual sin tener que esperar a que
// se dispare una publicación real desde Mercado Libre.
//
// Uso: entrando logueado, abrir en el navegador
//   /api/instagram/preview-cover?id=123
//
// Si la portada se puede generar bien, devuelve directamente la imagen
// PNG (se ve en el navegador). Si falla, devuelve el error REAL con su
// mensaje y stack — a diferencia del flujo automático (publish.js), que
// por diseño traga este error y sigue publicando sin portada para no
// cortar la publicación completa. Esta ruta es la forma de ver ese error
// sin ir a buscar en los logs de Vercel.
export async function GET(request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id'))

  if (!Number.isInteger(id)) {
    return NextResponse.json(
      { error: 'Pasá el id del vehículo como ?id=123 en la URL.' },
      { status: 400 },
    )
  }

  const { data: vehicle, error: fetchError } = await supabaseAdmin
    .from('vehiculos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!vehicle) {
    return NextResponse.json({ error: `No existe ningún vehículo con id ${id}.` }, { status: 404 })
  }

  if (!vehicle.imagenes || vehicle.imagenes.length === 0) {
    return NextResponse.json(
      { error: 'Este vehículo no tiene fotos cargadas, no se puede generar la portada.' },
      { status: 400 },
    )
  }

  try {
    const buffer = await generateCoverImageBuffer(vehicle)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[Instagram][preview-cover] Falló la generación de la portada:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : null,
        fotoUsada: vehicle.imagenes[0],
      },
      { status: 500 },
    )
  }
}
