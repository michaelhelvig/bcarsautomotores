import Link from 'next/link'
import VehicleForm from '../VehicleForm'
import { createVehicle } from '../actions'
import VolverALaWebButton from '../VolverALaWebButton'

export default function NuevoVehiculoPage() {
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
      <h1 className="text-2xl font-bold text-white mt-3 mb-8">Agregar auto</h1>

      <VehicleForm action={createVehicle} submitLabel="Crear auto" />
    </div>
  )
}