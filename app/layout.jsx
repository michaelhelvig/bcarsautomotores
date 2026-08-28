import { Poppins, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import LoadingScreen from '@/components/LoadingScreen'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

// TODO: reemplazar por el dominio real de BCARS AUTOMOTORES cuando esté definido.
const SITE_URL = 'https://www.bcarsautomotores.com.ar'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'BCARS AUTOMOTORES | Usados y 0km',
    template: '%s | BCARS AUTOMOTORES',
  },
  description:
    'Concesionario de autos usados y 0km multimarca. Confianza, calidad y respaldo, con financiación y gestoría propia.',
  keywords: [
    'autos usados',
    'concesionaria',
    '0km',
    'financiación de autos',
    'BCARS AUTOMOTORES',
  ],
  openGraph: {
    title: 'BCARS AUTOMOTORES',
    description:
      'Concesionario de autos usados y 0km multimarca. Confianza, calidad y respaldo.',
    locale: 'es_AR',
    type: 'website',
    siteName: 'BCARS AUTOMOTORES',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-graphite text-white min-h-screen">
        <LoadingScreen />

        <Navbar />

        <main>{children}</main>

        <Footer />

        <WhatsAppButton />
      </body>
    </html>
  )
}