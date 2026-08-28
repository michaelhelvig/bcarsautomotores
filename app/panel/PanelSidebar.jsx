'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function StatsIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M4 20V11M10 20V4M16 20v-6M4 20h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VehiclesIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M3 16v-2.5a2 2 0 0 1 .4-1.2L5 9.8A3 3 0 0 1 7.4 8.5h9.2a3 3 0 0 1 2.4 1.3l1.6 2.5c.26.36.4.8.4 1.2V16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="2" y="15.3" width="20" height="4.2" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7" cy="19.5" r="1.6" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.6" fill="currentColor" />
      <path d="M6 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function EntregasIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2.5l2.2 1.3 2.5-.3 1 2.3 2.3 1-.3 2.5 1.3 2.2-1.3 2.2.3 2.5-2.3 1-1 2.3-2.5-.3L12 21.5l-2.2-1.3-2.5.3-1-2.3-2.3-1 .3-2.5L3 12l1.3-2.2-.3-2.5 2.3-1 1-2.3 2.5.3L12 2.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.5 12.3l2.4 2.4 4.6-4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PersonIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c1.5-4 4.2-6 7.5-6s6 2 7.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function DotsIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  )
}

const ITEMS = [
  { href: '/panel', label: 'Estadísticas', icon: StatsIcon },
  { href: '/panel/vehiculos', label: 'Vehículos', icon: VehiclesIcon },
  { href: '/panel/entregas', label: 'Entregas', icon: EntregasIcon },
]

function AccountBlock({ email }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div ref={menuRef} className="relative flex items-center gap-3 border-t border-white/10 pt-4 px-1">
      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        <PersonIcon className="w-4 h-4 text-white/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">Administrador</p>
        <p className="text-xs text-white/40 truncate">{email}</p>
      </div>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Más opciones"
        className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors shrink-0"
      >
        <DotsIcon className="w-4 h-4" />
      </button>

      {menuOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl border border-white/10 bg-graphite-light shadow-card overflow-hidden z-10">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default function PanelSidebar({ email }) {
  const pathname = usePathname()

  function isActive(href) {
    return href === '/panel' ? pathname === '/panel' : pathname.startsWith(href)
  }

  function NavLinks() {
    return (
      <ul className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href} className="shrink-0 md:shrink">
            <Link
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${isActive(href)
                ? 'bg-graphite-light text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <>
      {/* Desktop: sidebar fija, pegada a la izquierda, debajo del navbar del sitio */}
      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 md:justify-between border-r border-white/10 bg-graphite-darker px-4 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 px-1">
            General
          </p>
          <NavLinks />
        </div>

        <AccountBlock email={email} />
      </aside>

      {/* Mobile: tabs horizontales + cuenta debajo, sin quedar fija */}
      <div className="md:hidden mb-6">
        <NavLinks />
        <div className="mt-4">
          <AccountBlock email={email} />
        </div>
      </div>
    </>
  )
}