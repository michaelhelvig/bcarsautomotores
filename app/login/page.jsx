'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError('Email o contraseña incorrectos.')
      return
    }

    // router.refresh() fuerza a que los Server Components (como el
    // middleware/proxy) vuelvan a leer la sesión recién creada antes de
    // navegar al dashboard.
    router.push('/panel')
    router.refresh()
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-graphite px-6 pt-24 sm:pt-28">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-graphite-darker rounded-2xl p-8 shadow-soft"
      >
        <h1 className="text-2xl font-bold text-white mb-1">Iniciar sesión</h1>
        <p className="text-white/60 text-sm mb-6">Panel de administración de BCARS AUTOMOTORES</p>

        <label className="block text-sm text-white/70 mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 rounded-lg bg-graphite border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-acento transition-colors"
        />

        <label className="block text-sm text-white/70 mb-1" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 rounded-lg bg-graphite border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-acento transition-colors"
        />

        {error && (
          <p className="text-sm text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-acento hover:bg-acento-dark transition-colors text-ink font-semibold rounded-full py-2.5 disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </section>
  )
}