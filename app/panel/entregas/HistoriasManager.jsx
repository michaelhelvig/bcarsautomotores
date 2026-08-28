'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowIcon, PlayIcon } from '@/components/icons'
import { saveHistorias } from './actions'

let idCounter = 0
function nextId() {
  idCounter += 1
  return `historia-${idCounter}-${Date.now()}`
}

export default function HistoriasManager({ initialItems = [] }) {
  const formRef = useRef(null)
  const router = useRouter()

  // Mismo esquema que la grilla de fotos de un vehículo:
  //   - kind 'existing': ya está en Storage -> item.url es la URL pública
  //   - kind 'new':      recién elegida, todavía no se subió -> item.file
  const [items, setItems] = useState(() =>
    initialItems.map((h) => ({
      id: nextId(),
      kind: 'existing',
      url: h.url,
      es_video: !!h.es_video,
    })),
  )
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleFilesSelected(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const nuevos = files.map((file) => ({
      id: nextId(),
      kind: 'new',
      file,
      url: URL.createObjectURL(file),
      es_video: false,
    }))
    setItems((prev) => [...prev, ...nuevos])
    e.target.value = ''
  }

  function moveItem(index, direction) {
    setItems((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
        ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function removeItem(index) {
    setItems((prev) => {
      const item = prev[index]
      if (item.kind === 'new') URL.revokeObjectURL(item.url)
      return prev.filter((_, i) => i !== index)
    })
  }

  function toggleVideo(index) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, es_video: !item.es_video } : item)),
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const formData = new FormData(formRef.current)

    const orden = []
    let nuevoIndex = 0
    for (const item of items) {
      if (item.kind === 'existing') {
        orden.push({ type: 'existing', url: item.url, es_video: item.es_video })
      } else {
        formData.append('fotos_nuevas', item.file)
        orden.push({ type: 'new', index: nuevoIndex, es_video: item.es_video })
        nuevoIndex += 1
      }
    }
    formData.append('orden', JSON.stringify(orden))

    startTransition(async () => {
      try {
        await saveHistorias(formData)
        router.refresh()
        setSaved(true)
      } catch (err) {
        setError(err?.message || 'Ocurrió un error al guardar. Probá de nuevo.')
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div key={item.id} className="relative group">
              <img
                src={item.url}
                alt=""
                className="w-full aspect-[9/16] object-cover rounded-xl border border-white/10"
              />

              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 text-[10px] font-bold uppercase tracking-wide bg-acento text-ink px-2 py-0.5 rounded-full">
                  Primera
                </span>
              )}
              {item.kind === 'new' && (
                <span className="absolute top-1.5 right-1.5 text-[10px] font-semibold bg-plata text-white px-2 py-0.5 rounded-full">
                  Nueva
                </span>
              )}

              <button
                type="button"
                onClick={() => toggleVideo(index)}
                aria-pressed={item.es_video}
                title="Marcar como historia de video (muestra un ícono de play)"
                className={`absolute bottom-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${item.es_video
                    ? 'bg-acento text-ink'
                    : 'bg-black/60 text-white/70 hover:text-white'
                  }`}
              >
                <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
              </button>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1.5 rounded-b-xl bg-gradient-to-t from-black/80 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  aria-label="Mover a la izquierda"
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/95 text-graphite disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowIcon direction="left" className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label="Quitar foto"
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/95 text-ink text-sm font-bold"
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Mover a la derecha"
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-white/95 text-graphite disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowIcon direction="right" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="inline-flex items-center gap-1.5 text-sm text-white font-semibold cursor-pointer hover:text-white/70 transition-colors">
          <span className="text-lg leading-none">+</span> Agregar fotos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
        </label>
        <p className="text-xs text-white/40 mt-1.5">
          Sacale una captura de pantalla a cada historia de Instagram y subila acá. Usá las
          flechas para reordenar, el ícono de ▶ para marcar las que sean video (muestra el
          ícono de play encima) y la ✕ para sacar una.
        </p>
      </div>

      {error && (
        <p className="text-sm text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}
      {saved && !pending && (
        <p className="text-sm text-plata bg-plata/10 border border-plata/30 rounded-lg px-4 py-2.5">
          Cambios guardados.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-acento hover:bg-acento-dark transition-colors text-ink font-semibold rounded-full px-6 py-2.5 disabled:opacity-60 disabled:cursor-wait"
      >
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}