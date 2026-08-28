'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowIcon } from '@/components/icons'

const TIPOS = ['Usado', '0KM']
const COMBUSTIBLES = ['Nafta', 'Diésel', 'Nafta/GNC', 'GNC', 'Eléctrico', 'Híbrido']
const TRANSMISIONES = ['Manual', 'Automática']
const DISPONIBILIDADES = ['Disponible', 'Con cita previa', 'Reservado', 'Vendido']

let idCounter = 0
function nextId() {
  idCounter += 1
  return `foto-${idCounter}-${Date.now()}`
}

export default function VehicleForm({ action, initialData = {}, submitLabel = 'Guardar' }) {
  const formRef = useRef(null)
  const router = useRouter()

  // Cada foto (ya subida o recién elegida) vive en este mismo array, en el
  // orden en que se van a guardar. La de índice 0 es la portada.
  //   - kind 'existing': ya está en Supabase Storage -> item.url es la URL pública
  //   - kind 'new':      recién elegida en este formulario, todavía no se subió
  //                      -> item.file es el File real, item.url es una preview local
  const [items, setItems] = useState(() =>
    (initialData.imagenes || []).map((url) => ({ id: nextId(), kind: 'existing', url })),
  )
  const [error, setError] = useState(null)
  const [pending, startTransition] = useTransition()

  // --- Reordenar fotos arrastrando ---
  // No reordenamos en vivo mientras se arrastra (eso obligaría a llevar
  // los refs de cada miniatura al día en cada frame); en cambio, sólo
  // resaltamos sobre qué foto está el puntero (overIndex) y aplicamos el
  // movimiento una única vez al soltar.
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const dragStateRef = useRef({ index: null, pointerId: null })
  const overIndexRef = useRef(null)
  const itemRefs = useRef({})

  function handlePointerDown(e, index) {
    // Si el gesto arranca sobre un botón (flechas / quitar), lo dejamos
    // pasar como click normal y no iniciamos el drag.
    if (e.target.closest('button')) return
    dragStateRef.current = { index, pointerId: e.pointerId }
    setDragIndex(index)
  }

  useEffect(() => {
    if (dragIndex === null) return

    function handlePointerMove(e) {
      if (e.pointerId !== dragStateRef.current.pointerId) return

      let target = null
      for (const [key, el] of Object.entries(itemRefs.current)) {
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          target = Number(key)
          break
        }
      }

      if (target !== null && target !== overIndexRef.current) {
        overIndexRef.current = target
        setOverIndex(target)
      }
    }

    function finishDrag() {
      const from = dragStateRef.current.index
      const to = overIndexRef.current
      if (from !== null && to !== null && from !== to) {
        setItems((prev) => {
          const next = [...prev]
          const [moved] = next.splice(from, 1)
          next.splice(to, 0, moved)
          return next
        })
      }
      dragStateRef.current = { index: null, pointerId: null }
      overIndexRef.current = null
      setDragIndex(null)
      setOverIndex(null)
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', finishDrag)
    document.addEventListener('pointercancel', finishDrag)
    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', finishDrag)
      document.removeEventListener('pointercancel', finishDrag)
    }
  }, [dragIndex])

  function handleFilesSelected(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const nuevos = files.map((file) => ({
      id: nextId(),
      kind: 'new',
      file,
      url: URL.createObjectURL(file),
    }))
    setItems((prev) => [...prev, ...nuevos])

    // Permite elegir el mismo archivo de nuevo más adelante si lo saca y
    // se arrepiente.
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
      // Libera memoria de la preview si era una foto recién elegida.
      if (item.kind === 'new') URL.revokeObjectURL(item.url)
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Arrancamos de los campos normales del form (marca, modelo, año, etc.)
    const formData = new FormData(formRef.current)

    // Y le sumamos el orden final de fotos: para las existentes viaja la
    // URL; para las nuevas viaja el archivo real + su posición dentro de
    // "fotos_nuevas", así el servidor puede reconstruir el orden exacto
    // una vez que las suba y consiga sus URLs definitivas.
    const orden = []
    let nuevoIndex = 0
    for (const item of items) {
      if (item.kind === 'existing') {
        orden.push({ type: 'existing', url: item.url })
      } else {
        formData.append('fotos_nuevas', item.file)
        orden.push({ type: 'new', index: nuevoIndex })
        nuevoIndex += 1
      }
    }
    formData.append('orden', JSON.stringify(orden))

    startTransition(async () => {
      try {
        await action(formData)
        router.refresh()
        router.push('/panel/vehiculos')
      } catch (err) {
        setError(err?.message || 'Ocurrió un error al guardar. Probá de nuevo.')
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Marca" name="marca" defaultValue={initialData.marca} required />
        <Field label="Modelo" name="modelo" defaultValue={initialData.modelo} required />
        <Field
          label="Año"
          name="anio"
          type="number"
          defaultValue={initialData.anio}
          required
        />
        <Field
          label="Kilómetros"
          name="km"
          type="number"
          defaultValue={initialData.km ?? 0}
        />
        <Field
          label="Precio"
          name="precio"
          defaultValue={initialData.precio}
          placeholder="USD 21.500"
          required
        />
        <Field label="Color" name="color" defaultValue={initialData.color} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Select label="Tipo" name="tipo" options={TIPOS} defaultValue={initialData.tipo} />
        <Select
          label="Combustible"
          name="combustible"
          options={COMBUSTIBLES}
          defaultValue={initialData.combustible}
        />
        <Select
          label="Transmisión"
          name="transmision"
          options={TRANSMISIONES}
          defaultValue={initialData.transmision}
        />
        <Select
          label="Disponibilidad"
          name="disponibilidad"
          options={DISPONIBILIDADES}
          defaultValue={initialData.disponibilidad ?? 'Disponible'}
        />
      </div>

      <label className="flex items-center gap-2 text-white/80 text-sm">
        <input
          type="checkbox"
          name="destacado"
          defaultChecked={initialData.destacado}
          className="accent-acento w-4 h-4"
        />
        Destacar este auto en la home
      </label>

      <div>
        <p className="text-sm text-white/70 mb-2">
          Fotos {items.length > 0 && `(${items.length})`}
        </p>

        {items.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => (itemRefs.current[index] = el)}
                onPointerDown={(e) => handlePointerDown(e, index)}
                className={
                  'relative group select-none touch-none cursor-grab active:cursor-grabbing rounded-lg transition-[opacity,box-shadow] ' +
                  (dragIndex === index ? 'opacity-40 ' : 'opacity-100 ') +
                  (dragIndex !== null && overIndex === index && dragIndex !== index
                    ? 'ring-2 ring-acento ring-offset-2 ring-offset-graphite-darker'
                    : '')
                }
              >
                <img
                  src={item.url}
                  alt=""
                  draggable={false}
                  className="w-full aspect-square object-cover rounded-lg border border-white/10 pointer-events-none"
                />

                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-bold uppercase tracking-wide bg-acento text-ink px-2 py-0.5 rounded-full">
                    Portada
                  </span>
                )}
                {item.kind === 'new' && (
                  <span className="absolute top-1.5 right-1.5 text-[10px] font-semibold bg-plata text-white px-2 py-0.5 rounded-full">
                    Nueva
                  </span>
                )}

                {/* Controles: aparecen al pasar el mouse (siempre visibles en mobile, para poder tocarlos) */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1.5 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    aria-label="Mover foto a la izquierda"
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
                    aria-label="Mover foto a la derecha"
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white/95 text-graphite disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowIcon direction="right" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
          La primera foto es la que se muestra como portada. Arrastrá una foto para
          reordenar (o usá las flechas) y la ✕ para sacar una — a las que ya estaban
          subidas, sacarlas las borra recién al guardar.
        </p>
      </div>

      {error && (
        <p className="text-sm text-white bg-white/10 border border-white/20 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-acento hover:bg-acento-dark transition-colors text-ink font-semibold rounded-full px-6 py-2.5 disabled:opacity-60 disabled:cursor-wait"
      >
        {pending ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}

function Field({ label, name, ...props }) {
  return (
    <label className="block text-sm text-white/70">
      {label}
      <input
        name={name}
        {...props}
        className="mt-1 w-full rounded-lg bg-graphite border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-acento transition-colors"
      />
    </label>
  )
}

function Select({ label, name, options, defaultValue }) {
  return (
    <label className="block text-sm text-white/70">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg bg-graphite border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-acento transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}