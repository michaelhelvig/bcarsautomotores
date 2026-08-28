import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VehicleForm from '../../VehicleForm'
import { updateVehicle } from '../../actions'
import VolverALaWebButton from '../../VolverALaWebButton'

export default async function EditarVehiculoPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: car } = await supabase.from('vehiculos').select('*').eq('id', id).single()
  if (!car) notFound()

  // Le "fijamos" el id al server action, así el form solo tiene que
  // mandar los campos editables — el id no viaja como input del usuario.
  const updateVehicleWithId = updateVehicle.bind(null, car.id)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/panel/vehiculos"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          ← Volver a Vehículos
        </Link>
        <VolverALaWebButton />
      </div>
      <h1 className="text-2xl font-bold text-white mt-3 mb-8">
        Editar {car.marca} {car.modelo}
      </h1>

      <VehicleForm action={updateVehicleWithId} initialData={car} submitLabel="Guardar cambios" />
    </div>
  )
}