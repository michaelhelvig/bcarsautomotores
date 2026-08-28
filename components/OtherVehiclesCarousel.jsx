'use client'

import VehicleCarousel from './VehicleCarousel'

export default function OtherVehiclesCarousel({ cars }) {
  if (cars.length === 0) return null

  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">
        ¡Aprovechá estas oportunidades en oferta!
      </h2>
      <p className="mt-2 text-sm text-white/50">Explorá otros de nuestros vehículos</p>

      <div className="mt-10">
        <VehicleCarousel cars={cars} pageSize={3} />
      </div>
    </div>
  )
}