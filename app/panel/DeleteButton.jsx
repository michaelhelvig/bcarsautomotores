'use client'

import { useTransition } from 'react'
import { deleteVehicle } from './actions'

export default function DeleteButton({ id, label }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const confirmed = confirm(`¿Seguro que querés borrar "${label}"? No se puede deshacer.`)
    if (!confirmed) return

    startTransition(() => {
      deleteVehicle(id)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm text-white/60 underline decoration-white/30 hover:text-white hover:decoration-white transition-colors disabled:opacity-50"
    >
      {isPending ? 'Borrando...' : 'Borrar'}
    </button>
  )
}