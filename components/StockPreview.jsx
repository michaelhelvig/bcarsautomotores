import Link from 'next/link'
import VehicleCarousel from './VehicleCarousel'
import { getStock } from '@/lib/vehicles'

export default async function StockPreview() {
  const stock = await getStock()

  return (
    <section id="stock" className="py-24 bg-graphite-darker">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">¡Aprovechá estas oportunidades únicas!</h2>
          <p className="mt-3 text-white/60">
            Unidades usadas seleccionadas y modelos 0km, listos para entrega.
          </p>
        </div>

        <div className="mt-14">
          <VehicleCarousel cars={stock} pageSize={3} priority />
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/stock"
            className="inline-flex items-center gap-2 bg-acento text-ink font-semibold px-6 py-3 rounded-full shadow-soft hover:bg-acento-dark transition-colors"
          >
            Ver todo el stock →
          </Link>
        </div>
      </div>
    </section>
  )
}