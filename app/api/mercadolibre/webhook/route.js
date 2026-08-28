import { NextResponse, after } from 'next/server'
import { syncSingleVehicle } from '@/lib/mercadolibre/syncVehicles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Mercado Libre espera una respuesta 200 casi inmediata (recomiendan
// no pasar de ~500ms) y reintenta agresivamente si no la recibe a tiempo
// — si reintenta demasiado, puede llegar a desactivar la suscripción al
// webhook. Por eso acá NO esperamos a que termine la sincronización:
// respondemos 200 al toque, y el trabajo real (pedirle el item a la API
// de ML + guardarlo en Supabase) se hace después, con after().
export async function POST(request) {
  let body

  try {
    body = await request.json()
  } catch {
    // Un body inválido no es algo que podamos procesar, pero igual
    // respondemos 200 para que ML no lo reintente indefinidamente.
    return NextResponse.json({ received: true })
  }

  const { resource, topic, application_id: applicationId } = body || {}

  console.log('[Mercado Libre Webhook] Notificación recibida:', {
    topic,
    resource,
    applicationId,
  })

  // Chequeo básico de sanidad: que la notificación sea realmente para
  // nuestra aplicación. No es una validación de firma (ML no la ofrece
  // para este tipo de webhook), pero evita procesar payloads que no nos
  // correspondan.
  const expectedAppId = process.env.MERCADOLIBRE_CLIENT_ID
  if (expectedAppId && String(applicationId) !== String(expectedAppId)) {
    console.warn('[Mercado Libre Webhook] application_id no coincide, se ignora.')
    return NextResponse.json({ received: true })
  }

  // Solo nos interesan cambios de publicaciones ("items"). ML puede
  // mandar otros tópicos (preguntas, órdenes, etc.) si en algún momento
  // se suscriben sin querer — los ignoramos sin procesarlos.
  const itemId = topic === 'items' ? resource?.split('/').pop() : null

  if (itemId) {
    after(async () => {
      try {
        await syncSingleVehicle(itemId)
      } catch (error) {
        console.error(`[Mercado Libre Webhook] Error sincronizando ${itemId}:`, error)
      }
    })
  }

  return NextResponse.json({ received: true })
}