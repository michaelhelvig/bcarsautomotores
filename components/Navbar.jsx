'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

const LINKS = [
  { name: 'INICIO', url: '/', sectionId: null },
  { name: 'CATÁLOGO', url: '/stock', sectionId: null },
  { name: 'CONTACTO', url: '/#ubicacion', sectionId: 'ubicacion' },
]

const WHATSAPP_MESSAGE = 'Hola, quiero agendar una visita a BCARS AUTOMOTORES!'

function MenuIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// Sidebar mobile: se desliza desde la derecha y deja un margen a la
// izquierda (no tapa toda la pantalla) para que se siga viendo un poco
// la página de fondo, como referencia de que seguís ahí. El fondo
// oscurecido (overlay) es lo que ocupa el resto y cierra el menú al
// tocarlo.
function MobileMenu({ open, onClose, links, activeLink }) {
  // Bloquea el scroll del body mientras el menú está abierto, para que
  // no se pueda scrollear "atrás" de él en mobile.
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  return (
    <div
      className={
        'md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ' +
        (open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')
      }
      aria-hidden={!open}
    >
      {/* Overlay: oscurece la página de fondo pero la deja visible detrás,
          y cierra el menú al tocarlo (fuera del panel) */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      {/* Panel del menú: ancho parcial (no pantalla completa), pegado a
          la derecha, se desliza con transform en vez de mostrarse/
          ocultarse de golpe */}
      <div
        className={
          'absolute top-0 right-0 h-full w-[78%] max-w-xs bg-ink shadow-[-10px_0_30px_-12px_rgba(0,0,0,0.6)] ' +
          'flex flex-col transition-transform duration-300 ease-out ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
      >
        <div className="flex items-center justify-between px-6 h-20">
          <Image src="/logo.png?v=3" alt="BCARS AUTOMOTORES" width={140} height={46} className="h-10 w-auto" />
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onClose}
            className="p-2 -mr-2 text-white/70 hover:text-white transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-6 mt-4">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.url}
              onClick={onClose}
              className={
                'py-3.5 text-base font-semibold tracking-wide border-b border-white/10 transition-colors ' +
                (activeLink === link.name ? 'text-white' : 'text-white/70 hover:text-white')
              }
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="px-6 mt-auto mb-8">
          <Link
            href={buildWhatsAppUrl(WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center rounded-md border border-white/70 px-4 py-3 text-xs font-bold tracking-wide text-white hover:bg-white hover:text-ink transition-colors"
          >
            AGENDÁ TU VISITA
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('INICIO')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isPanel = pathname?.startsWith('/panel')

  // Si se navega (o cambia de pantalla a desktop) con el menú mobile
  // abierto, lo cierra para no dejarlo "colgado" abierto de fondo.
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)

      if (pathname === '/stock') {
        setActiveLink('CATÁLOGO')
        return
      }

      const locationSection = document.getElementById('location')
      const scrollMidpoint = window.scrollY + window.innerHeight / 2

      if (locationSection && scrollMidpoint >= locationSection.offsetTop) {
        setActiveLink('CONTACTO')
      } else {
        setActiveLink('INICIO')
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  const headerBackgroundClass = isScrolled
    ? 'bg-ink/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.08)]'
    : 'bg-transparent'

  if (isPanel) return null

  return (
    <>
      <header
        className={
          'fixed top-0 inset-x-0 z-50 transition-colors duration-300 ' +
          headerBackgroundClass
        }
      >
        <div className="container mx-auto flex h-20 sm:h-24 md:h-28 items-center justify-between gap-4 px-4 sm:px-8">
          <Link href="/" className="flex items-center shrink-0" aria-label="BCARS AUTOMOTORES: ir al inicio">
            <Image
              src="/logo.png?v=3"
              alt="BCARS AUTOMOTORES"
              width={300}
              height={100}
              className="h-14 w-auto sm:h-16"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map((link) => {
              const isActive = activeLink === link.name

              return (
                <Link
                  key={link.name}
                  href={link.url}
                  className="group relative pb-1 text-sm font-semibold tracking-wide text-white/80 hover:text-white transition-colors"
                >
                  <span className={isActive ? 'text-white' : ''}>
                    {link.name}
                  </span>
                  <span
                    className={
                      'absolute left-0 -bottom-1 h-0.5 w-full bg-white transition-opacity duration-200 ' +
                      (isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')
                    }
                  />
                </Link>
              )
            })}
          </nav>

          <Link
            href={buildWhatsAppUrl(WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center rounded-md border border-white/70 px-4 py-2 text-xs font-bold tracking-wide text-white hover:bg-white hover:text-ink transition-colors">
            AGENDÁ TU VISITA
          </Link>

          {/* Botón hamburguesa: solo en mobile (donde el <nav> de arriba
              está oculto), arriba a la derecha */}
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -mr-2 text-white hover:text-white/80 transition-colors"
          >
            <MenuIcon className="w-7 h-7" />
          </button>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={LINKS}
        activeLink={activeLink}
      />
    </>
  )
}