// TODO: reemplazar por el dominio real de Bcars Automotores cuando esté definido.
const SITE_URL = 'https://www.bcarsautomotores.com.ar'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
