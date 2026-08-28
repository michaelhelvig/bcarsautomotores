import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { valorStockPorMoneda } from '@/lib/format'
import { slugify } from '@/lib/vehicles'
import VolverALaWebButton from './VolverALaWebButton'
import { DollarSign, Star, Eye } from 'lucide-react'

export default async function EstadisticasPage() {
  const supabase = await createClient()

  const { data: vehiculos } = await supabase
    .from('vehiculos')
    .select('marca, modelo, precio, disponibilidad, vistas, imagenes')

  const autos = vehiculos || []
  const disponibles = autos.filter((v) => v.disponibilidad === 'Disponible').length
  const vendidos = autos.filter((v) => v.disponibilidad === 'Vendido').length
  const valorStock = valorStockPorMoneda(autos.filter((v) => v.disponibilidad !== 'Vendido'))

  const masVisto = autos.reduce((top, car) => {
    const vistas = car.vistas || 0
    if (vistas <= 0) return top
    if (!top || vistas > top.vistas) return { ...car, vistas }
    return top
  }, null)

  const totalStock = autos.length
  const porcentaje = (n) => (totalStock > 0 ? `${Math.round((n / totalStock) * 100)}%` : null)

  const masVistoHref =
    masVisto && masVisto.disponibilidad !== 'Vendido'
      ? `/stock/${slugify(`${masVisto.marca} ${masVisto.modelo}`)}`
      : null

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-white">Estadísticas</h2>
        <VolverALaWebButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          emoji="🟢"
          label="Vehículos disponibles"
          value={disponibles}
          percent={porcentaje(disponibles)}
          highlight="Listos para vender"
          sub={`${totalStock} vehículos en el stock total`}
        />
        <StatCard
          emoji="🔴"
          label="Vehículos vendidos"
          value={vendidos}
          percent={porcentaje(vendidos)}
          highlight="Autos ya entregados"
          sub={`${totalStock} vehículos en el stock total`}
        />
        <StatCard
          icon={DollarSign}
          label="Valor total del stock"
          value={
            valorStock.length > 0 ? (
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {valorStock.map((v) => (
                  <span key={v.moneda}>{v.texto}</span>
                ))}
              </span>
            ) : (
              '—'
            )
          }
          highlight="Disponible para la venta"
          sub="Suma del precio de los autos no vendidos"
        />
      </div>

      <div className="mt-8 flex justify-center">
        <BoxWrapper href={masVistoHref} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-center gap-2 text-sm text-white/50 mb-6">
            <Star className="w-4 h-4" aria-hidden />
            Vehículo más visto
          </div>

          {masVisto ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-52 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-white/5 shrink-0">
                {masVisto.imagenes?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={masVisto.imagenes[0]}
                    alt={`${masVisto.marca} ${masVisto.modelo}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-sm text-center px-3">
                    Sin foto cargada
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {masVisto.marca} {masVisto.modelo}
                </p>
                <p className="mt-1.5 inline-flex items-center justify-center sm:justify-start gap-1.5 text-white/70 text-sm font-medium">
                  <Eye className="w-4 h-4" aria-hidden />
                  {masVisto.vistas} vistas
                </p>
                <p className="mt-3 text-sm text-white/40">El más visitado del catálogo</p>
              </div>
            </div>
          ) : (
            <p className="text-white/50 text-sm text-center py-6">
              Todavía no hay vistas registradas.
            </p>
          )}
        </BoxWrapper>
      </div>
    </div>
  )
}

function BoxWrapper({ href, className, children }) {
  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} block transition-colors hover:border-white/25 hover:bg-white/[0.05]`}
      >
        {children}
      </Link>
    )
  }

  return <div className={className}>{children}</div>
}

function StatCard({ emoji, icon: Icon, label, value, percent, highlight, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-white/50">{label}</p>

        <span className="inline-flex items-center gap-1 shrink-0 rounded-md border border-white/15 px-2 py-1 text-[11px] font-semibold text-white/80">
          {Icon ? <Icon className="w-3.5 h-3.5" aria-hidden /> : <span aria-hidden>{emoji}</span>}
          {percent && <span>{percent}</span>}
        </span>
      </div>

      <div className="mt-2 text-2xl sm:text-3xl font-bold text-white leading-tight">{value}</div>

      {(highlight || sub) && (
        <div className="mt-3 space-y-0.5">
          {highlight && (
            <p className="text-sm font-semibold text-white flex items-center gap-1">
              {highlight}
              <span aria-hidden>↗</span>
            </p>
          )}
          {sub && <p className="text-sm text-white/40">{sub}</p>}
        </div>
      )}
    </div>
  )
}