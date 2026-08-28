import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Suma 1 vista al vehículo. Se llama desde el detalle público del auto
// (VehicleDetailView) cada vez que alguien entra a esa página. Usa una
// función de Postgres (increment_vistas) para que el +1 sea atómico y no
// se pisen las vistas si dos personas entran casi al mismo tiempo.
export async function POST(_request, { params }) {
  const { id } = await params
  const vehiculoId = Number(id)

  if (!Number.isInteger(vehiculoId)) {
    return NextResponse.json({ error: 'Id inválido' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.rpc('increment_vistas', {
    vehiculo_id: vehiculoId,
  })

  if (error) {
    console.error('Error al sumar la vista:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
