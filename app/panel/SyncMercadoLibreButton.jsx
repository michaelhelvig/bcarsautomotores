'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SyncMercadoLibreButton() {
  const router = useRouter()
  const [state, setState] = useState('idle')
  const [message, setMessage] = useState('')

  async function sync() {
    setState('loading')
    setMessage('')

    try {
      const response = await fetch('/api/mercadolibre/sync', { method: 'POST' })
      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'No se pudo sincronizar.')
      }

      const errors = result.errors?.length || 0
      setMessage(
        `Sincronización completada: ${result.createdOrUpdated}/${result.found} vehículos.${errors ? ` ${errors} con error.` : ''}`,
      )
      setState('success')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ocurrió un error.')
      setState('error')
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={sync}
        disabled={state === 'loading'}
        className="bg-plata hover:opacity-90 transition-opacity text-white text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-60 disabled:cursor-wait"
      >
        {state === 'loading' ? 'Sincronizando...' : '↻ Sincronizar Mercado Libre'}
      </button>

      {message && (
        <p className={`text-xs ${state === 'error' ? 'text-white font-semibold' : 'text-white/60'}`}>
          {message}
        </p>
      )}
    </div>
  )
}