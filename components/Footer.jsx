import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-graphite-darker text-white/70">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center">
          <Image
            src="/logo.png?v=3"
            alt="BCARS AUTOMOTORES"
            width={300}
            height={100}
            className="h-16 w-auto sm:h-20"
          />
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
          <li><Link href="/stock" className="hover:text-white transition-colors">Catálogo</Link></li>
          <li><Link href="/#location" className="hover:text-white transition-colors">Contacto</Link></li>
        </ul>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} BCARS AUTOMOTORES. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}