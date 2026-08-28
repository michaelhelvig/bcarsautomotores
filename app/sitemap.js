import { getStock } from '@/lib/vehicles'

// TODO: reemplazar por el dominio real de Bcars Automotores cuando esté definido.
const SITE_URL = 'https://www.bcarsautomotores.com.ar'

export default async function sitemap() {
  const staticRoutes = ['', '/stock'].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }))

  const stock = await getStock()
  const vehicleRoutes = stock.map((car) => ({
    url: `${SITE_URL}/stock/${car.slug}`,
    lastModified: new Date(),
  }))

  return [...staticRoutes, ...vehicleRoutes]
}