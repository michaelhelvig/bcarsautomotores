import { notFound } from 'next/navigation'
import { getStock, getVehicleBySlug } from '@/lib/vehicles'
import VehicleDetailView from '@/components/VehicleDetailView'

// Pre-genera las páginas de todos los autos en el build, para máxima
// velocidad y SEO (HTML ya listo para cada auto, sin esperar al pedido).
export async function generateStaticParams() {
  const stock = await getStock()
  return stock.map((car) => ({ slug: car.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const car = await getVehicleBySlug(slug)
  if (!car) return { title: 'Vehículo no encontrado' }

  const title = `${car.marca} ${car.modelo} ${car.anio}`
  const kmText = car.km === 0 ? '0 km' : `${car.km.toLocaleString('es-AR')} km`
  const description = `${car.marca} ${car.modelo} ${car.anio} · ${kmText} · ${car.precio}. Disponible en BCARS AUTOMOTORES`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: car.imagen ? [{ url: car.imagen }] : undefined,
    },
  }
}

export default async function VehicleDetailPage({ params }) {
  const { slug } = await params
  const car = await getVehicleBySlug(slug)
  if (!car) notFound()

  const stock = await getStock()
  const otherCars = stock.filter((c) => c.slug !== car.slug)

  return <VehicleDetailView car={car} otherCars={otherCars} />
}