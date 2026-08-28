import StockCatalog from '@/components/StockCatalog'
import { getStock } from '@/lib/vehicles'

export async function generateMetadata() {
  const stock = await getStock()
  return {
    title: 'Stock de vehículos',
    description: `Catálogo completo de autos usados y 0km disponibles en BCARS AUTOMOTORES: ${stock.length} unidades listas para entrega.`,
  }
}

export default async function StockPage() {
  const stock = await getStock()

  return (
    <section className="pt-32 pb-24 sm:pt-40 bg-graphite min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <StockCatalog stock={stock} />
      </div>
    </section>
  )
}