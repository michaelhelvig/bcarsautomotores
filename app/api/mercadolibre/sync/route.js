import { NextResponse } from 'next/server'
import { syncMercadoLibreVehicles } from '@/lib/mercadolibre/syncVehicles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  try {
    const result = await syncMercadoLibreVehicles()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Error sincronizando Mercado Libre:', error)

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error desconocido.',
      },
      { status: 500 },
    )
  }
}
