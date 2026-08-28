'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import StockCard from './StockCard'
import StockFilters from './StockFilters'
import { precioNumerico } from '@/lib/format'

// Junta los valores distintos de un campo presentes en el stock, sin
// vacíos y ordenados alfabéticamente — así los filtros siempre reflejan
// lo que realmente existe en tu catálogo (autos sincronizados desde
// MercadoLibre), en vez de una lista fija que se puede desactualizar.
function distinctValues(stock, field) {
  return [...new Set(stock.map((car) => car[field]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es')
  )
}

// Redondea el kilometraje máximo del stock hacia arriba, a un número
// prolijo para el slider (ej: 87.400 -> 90.000).
function kmTecho(stock) {
  const max = Math.max(0, ...stock.map((car) => car.km || 0))
  return Math.max(10000, Math.ceil(max / 10000) * 10000)
}

export default function StockCatalog({ stock }) {
  const [search, setSearch] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [marca, setMarca] = useState('')
  const [transmision, setTransmision] = useState('')
  const [combustiblesSeleccionados, setCombustiblesSeleccionados] = useState(new Set())
  const [ordenar, setOrdenar] = useState('relevancia')

  const kmMaxDisponible = useMemo(() => kmTecho(stock), [stock])
  const [kmLimit, setKmLimit] = useState(kmMaxDisponible)

  const marcas = useMemo(() => distinctValues(stock, 'marca'), [stock])
  const transmisiones = useMemo(() => distinctValues(stock, 'transmision'), [stock])
  const combustibles = useMemo(() => distinctValues(stock, 'combustible'), [stock])

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(marca) ||
    Boolean(transmision) ||
    combustiblesSeleccionados.size > 0 ||
    kmLimit < kmMaxDisponible

  function toggleCombustible(option) {
    setCombustiblesSeleccionados((prev) => {
      const next = new Set(prev)
      next.has(option) ? next.delete(option) : next.add(option)
      return next
    })
  }

  function limpiarFiltros() {
    setSearch('')
    setMarca('')
    setTransmision('')
    setCombustiblesSeleccionados(new Set())
    setKmLimit(kmMaxDisponible)
  }

  const resultado = useMemo(() => {
    const filtrado = stock.filter((car) => {
      if (search && !`${car.marca} ${car.modelo}`.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (marca && car.marca !== marca) return false
      if (transmision && car.transmision !== transmision) return false
      if (combustiblesSeleccionados.size > 0 && !combustiblesSeleccionados.has(car.combustible)) {
        return false
      }
      if ((car.km || 0) > kmLimit) return false
      return true
    })

    const sorted = [...filtrado]
    if (ordenar === 'precio-asc') sorted.sort((a, b) => precioNumerico(a) - precioNumerico(b))
    if (ordenar === 'precio-desc') sorted.sort((a, b) => precioNumerico(b) - precioNumerico(a))
    if (ordenar === 'km-asc') sorted.sort((a, b) => a.km - b.km)
    if (ordenar === 'anio-desc') sorted.sort((a, b) => b.anio - a.anio)
    return sorted
  }, [stock, search, marca, transmision, combustiblesSeleccionados, kmLimit, ordenar])

  const filtersProps = {
    marcas,
    marca,
    onMarcaChange: setMarca,
    transmisiones,
    transmision,
    onTransmisionChange: setTransmision,
    combustibles,
    combustiblesSeleccionados,
    onToggleCombustible: toggleCombustible,
    ordenar,
    onOrdenarChange: setOrdenar,
    kmMaxDisponible,
    kmLimit,
    onKmLimitChange: setKmLimit,
    hasActiveFilters,
    onLimpiar: limpiarFiltros,
  }

  return (
    <div>
      {/* Buscador + contador, arriba de todo */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
        <label className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca o modelo..."
            className="w-full bg-graphite-darker rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-acento/60"
          />
        </label>

        {/* Botón "Filtros" solo en mobile */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 bg-graphite-darker rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shrink-0"
        >
          <SlidersHorizontal size={16} />
          Filtros
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-acento" />}
        </button>
      </div>

      <p className="text-sm text-white/50 mb-6">{resultado.length} disponibles</p>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar: siempre visible en desktop */}
        <aside className="hidden lg:block w-80 shrink-0 lg:sticky lg:top-24">
          <StockFilters {...filtersProps} />
        </aside>

        {/* Panel de filtros en mobile: overlay a pantalla completa */}
        {mobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 z-[60] bg-graphite-darker overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Filtros</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Cerrar filtros"
                className="w-9 h-9 rounded-full bg-graphite-light flex items-center justify-center text-white"
              >
                <X size={18} />
              </button>
            </div>
            <StockFilters {...filtersProps} />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full bg-acento text-ink font-semibold py-3.5 rounded-full"
            >
              Ver {resultado.length} resultados
            </button>
          </div>
        )}

        {/* Grilla de resultados */}
        <div className="flex-1 w-full">
          {resultado.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white/60">No encontramos vehículos con esos filtros.</p>
              <button
                onClick={limpiarFiltros}
                className="mt-3 text-sm font-semibold text-acento hover:text-acento-dark"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {resultado.map((car, i) => (
                <StockCard key={car.id} car={car} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}