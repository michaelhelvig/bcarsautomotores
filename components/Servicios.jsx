import { Car, DollarSign, RefreshCw, ArrowRight } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

const SERVICIOS = [
  {
    numero: '01',
    icono: Car,
    titulo: 'Vehículos 0km y Usados',
    descripcion:
      'Amplia selección de vehículos nuevos y usados seleccionados con garantía escrita.',
    bullets: ['Garantía escrita', 'Revisados en 100+ puntos', 'Stock con entrega inmediata'],
    linkTexto: 'Ver catálogo completo',
    href: '/stock',
  },
  {
    numero: '02',
    icono: DollarSign,
    titulo: 'Financiación Personalizada',
    descripcion:
      'Planes de financiación adaptados a tu presupuesto y necesidades con la mejor tasa del mercado.',
    bullets: ['Cuotas fijas y en pesos', 'Aprobación en 24hs', 'Mínimos requisitos'],
    linkTexto: 'Consultar financiación',
    href: buildWhatsAppUrl('Hola, quiero consultar por financiación para comprar un auto.'),
  },
  {
    numero: '03',
    icono: RefreshCw,
    titulo: 'Tomamos tu Usado',
    descripcion:
      'Evaluamos tu vehículo actual como parte de pago al instante y con la mejor cotización.',
    bullets: ['Cotización sin cargo', 'Mejor valor del mercado', 'Sistema Llave por Llave'],
    linkTexto: 'Consultar tasación',
    href: buildWhatsAppUrl('Hola, quiero cotizar mi auto como parte de pago.'),
  },
]

export default function Servicios() {
  return (
    <section id="servicios" className="py-24 bg-graphite-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-sm font-semibold text-acento uppercase tracking-wide">
            Servicios
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">
            Todo lo que necesitás para cambiar de auto
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICIOS.map((s) => {
            const Icono = s.icono
            return (
              <div
                key={s.numero}
                className="group/card relative bg-graphite-dark rounded-2xl p-8 border border-white/10 flex flex-col transition-colors duration-500 hover:border-white/25"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 shadow-[0_0_40px_6px_rgba(255,255,255,0.12)]"
                />

                <div className="flex items-start justify-between">
                  <span className="w-12 h-12 rounded-xl bg-acento/15 text-acento flex items-center justify-center">
                    <Icono className="w-6 h-6" strokeWidth={2} />
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">{s.titulo}</h3>
                <p className="mt-3 text-white/60 text-sm leading-relaxed">{s.descripcion}</p>

                <ul className="mt-5 space-y-2.5">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-acento shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                <a
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between group"
                >
                  <span className="text-sm font-semibold text-white">{s.linkTexto}</span>
                  <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white transition-colors group-hover:bg-acento group-hover:border-acento group-hover:text-ink">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}