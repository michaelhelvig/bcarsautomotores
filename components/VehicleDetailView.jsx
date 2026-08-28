'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ImageGallery from './ImageGallery'
import SpecsTable from './SpecsTable'
import OtherVehiclesCarousel from './OtherVehiclesCarousel'
import Location from './Location'
import { ArrowIcon, ShareIcon } from './icons'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

export default function VehicleDetailView({ car, otherCars }) {
  const [shared, setShared] = useState(false)
  const vistaContada = useRef(false)

  const isZeroKm = car.km === 0 || Number(car.km) === 0 || car.tipo?.toLowerCase() === '0km'

  // Suma una vista cada vez que se entra al detalle de este auto. El ref
  // evita que se cuente dos veces por el doble efecto de React en
  // desarrollo (Strict Mode), sin depender de nada del lado del servidor
  // (la página es estática, así que esto tiene que pasar en el cliente).
  useEffect(() => {
    if (vistaContada.current) return
    vistaContada.current = true

    fetch(`/api/vehiculos/${car.id}/vista`, { method: 'POST' }).catch(() => {
      // Si falla el conteo no queremos romper la experiencia del usuario.
    })
  }, [car.id])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: `${car.marca} ${car.modelo}`, url })
      } catch {
        // el usuario canceló el share, no hacemos nada
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      // clipboard no disponible, no hacemos nada
    }
  }

  return (
    <>
      <section className="pt-28 pb-20 sm:pt-32 bg-graphite">
        <div className="max-w-6xl mx-auto px-6">
          {/* Barra superior */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/stock"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-acento transition-colors"
            >
              <ArrowIcon direction="left" className="w-4 h-4" />
              Catálogo
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-acento transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              {shared ? '¡Enlace copiado!' : 'Compartir'}
            </button>
          </div>

          {/* Galería + info */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
              <ImageGallery
                images={car.imagenes}
                alt={`${car.marca} ${car.modelo}`}
                viewsCount={car.vistas || 0}
              />
            </div>

            <div className="lg:col-span-2 bg-graphite-light rounded-2xl border border-white/10 shadow-card overflow-hidden lg:sticky lg:top-28">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${isZeroKm ? 'bg-acento text-ink' : 'bg-plata/15 text-plata'
                      }`}
                  >
                    {isZeroKm ? '0km' : (car.tipo || 'Usado')}
                  </span>

                  {car.meli_permalink && (
                    <a
                      href={car.meli_permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#FFE600] hover:text-[#FFE600]/80 transition-colors shrink-0"
                    >
                      Ver en MercadoLibre ↗
                    </a>
                  )}
                </div>

                <p className="mt-4 text-xs font-semibold text-acento uppercase tracking-wide">
                  {car.marca}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mt-1">
                  {car.modelo}
                </h1>

                <div className="mt-6 grid grid-cols-3 gap-3 bg-white/5 rounded-xl p-3">
                  <div className="text-center">
                    <p className="text-xs text-white/50">Kilómetros</p>
                    <p className="font-semibold text-white mt-0.5 text-sm">
                      {car.km === 0 ? '0 km' : `${car.km.toLocaleString('es-AR')} km`}
                    </p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-xs text-white/50">Año</p>
                    <p className="font-semibold text-white mt-0.5 text-sm">{car.anio}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/50">Combustible</p>
                    <p className="font-semibold text-white mt-0.5 text-sm">{car.combustible || '—'}</p>
                  </div>
                </div>

                <p className="mt-6 text-3xl font-bold text-white">{car.precio}</p>

                <div className="mt-3 h-px bg-white/10" />

                <a
                  href={buildWhatsAppUrl(
                    `Hola, necesito mas información sobre el vehiculo ${car.marca} ${car.modelo} ${car.anio}`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 bg-acento text-ink font-semibold px-6 py-3.5 rounded-full shadow-soft hover:bg-acento-dark transition-colors"
                >
                  Consultar por este auto
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Especificaciones */}
      <section className="py-16 bg-graphite-dark">
        <div className="max-w-4xl mx-auto px-6">
          <SpecsTable car={car} />
        </div>
      </section>

      {/* Otros vehículos */}
      <section className="py-20 bg-graphite">
        <div className="max-w-6xl mx-auto px-6">
          <OtherVehiclesCarousel cars={otherCars} />
        </div>
      </section>

      {/* Ubicación */}
      <Location />
    </>
  )
}