import Link from 'next/link'
import Image from 'next/image'
import { CarIcon } from './icons'

export default function StockCard({ car, priority = false }) {
  const isZeroKm = car.km === 0 || Number(car.km) === 0 || car.tipo?.toLowerCase() === '0km'

  return (
    <div className="group bg-graphite-light rounded-2xl border border-white/10 shadow-card overflow-hidden hover:-translate-y-1.5 transition-transform duration-300">
      <Link href={`/stock/${car.slug}`} className="block">
        <div className="relative h-40 bg-gradient-to-br from-graphite-dark to-graphite flex items-center justify-center overflow-hidden">
          {car.imagen ? (
            <Image
              src={car.imagen}
              alt={`${car.marca} ${car.modelo}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <CarIcon className="w-28 text-white/70 drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
          )}
          <span
            className={`absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
              isZeroKm ? 'bg-ink text-white' : 'bg-white text-graphite'
            }`}
          >
            {isZeroKm ? '0km' : (car.tipo || 'Usado')}
          </span>
          {car.destacado && (
            <span className="absolute top-3 right-3 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border border-white/80 text-white bg-black/50 backdrop-blur-sm">
              Destacado
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <p className="text-xs font-semibold text-acento uppercase tracking-wide">{car.marca}</p>
        <h3 className="text-lg font-semibold text-white mt-0.5">{car.modelo}</h3>

        <div className="mt-3 flex items-center gap-3 text-sm text-white/50">
          <span>{car.anio}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{car.km === 0 ? '0 km' : `${car.km.toLocaleString('es-AR')} km`}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-white">{car.precio}</span>
          <Link
            href={`/stock/${car.slug}`}
            className="text-sm font-semibold text-acento hover:text-acento-dark transition-colors"
          >
            Ver detalle →
          </Link>
        </div>
      </div>
    </div>
  )
}