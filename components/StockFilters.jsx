'use client'

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Más relevantes' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
  { value: 'km-asc', label: 'Menor kilometraje' },
  { value: 'anio-desc', label: 'Año: más nuevo' },
]

function PillGroup({ options, isActive, onToggle }) {
  if (options.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = isActive(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${active
                ? 'bg-white text-graphite-darker'
                : 'bg-graphite-light text-white/70 hover:text-white'
              }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default function StockFilters({
  marcas,
  marca,
  onMarcaChange,
  transmisiones,
  transmision,
  onTransmisionChange,
  combustibles,
  combustiblesSeleccionados,
  onToggleCombustible,
  ordenar,
  onOrdenarChange,
  kmMaxDisponible,
  kmLimit,
  onKmLimitChange,
  hasActiveFilters,
  onLimpiar,
}) {
  return (
    <div className="bg-graphite-darker rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Filtros</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onLimpiar}
            className="flex items-center gap-1 text-sm font-semibold text-acento hover:text-acento-dark transition-colors"
          >
            <span aria-hidden="true">✕</span> Limpiar
          </button>
        )}
      </div>

      {/* Marca */}
      <div className="mt-7">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">Marca</p>
        <select
          value={marca}
          onChange={(e) => onMarcaChange(e.target.value)}
          className="mt-3 w-full bg-graphite-light rounded-xl px-4 py-3.5 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-acento/60 appearance-none bg-no-repeat bg-[right_1rem_center]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff99' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          }}
        >
          <option value="">Todas las marcas</option>
          {marcas.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Transmisión */}
      {transmisiones.length > 0 && (
        <div className="mt-7">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
            Transmisión
          </p>
          <PillGroup
            options={transmisiones}
            isActive={(opt) => transmision === opt}
            onToggle={(opt) => onTransmisionChange(transmision === opt ? '' : opt)}
          />
        </div>
      )}

      {/* Combustible */}
      {combustibles.length > 0 && (
        <div className="mt-7">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
            Combustible
          </p>
          <PillGroup
            options={combustibles}
            isActive={(opt) => combustiblesSeleccionados.has(opt)}
            onToggle={onToggleCombustible}
          />
        </div>
      )}

      {/* Ordenar por (reemplaza al rango de precio) */}
      <div className="mt-7">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">Ordenar por</p>
        <select
          value={ordenar}
          onChange={(e) => onOrdenarChange(e.target.value)}
          className="mt-3 w-full bg-graphite-light rounded-xl px-4 py-3.5 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-acento/60 appearance-none bg-no-repeat bg-[right_1rem_center]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff99' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Kilometraje máximo */}
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">
            Kilometraje máximo
          </p>
          <span className="text-xs font-semibold text-white/50">
            {kmLimit >= kmMaxDisponible ? 'Sin límite' : `${kmLimit.toLocaleString('es-AR')} km`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={kmMaxDisponible}
          step={1000}
          value={kmLimit}
          onChange={(e) => onKmLimitChange(Number(e.target.value))}
          className="mt-4 w-full accent-acento cursor-pointer"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-white/40">
          <span>0 km</span>
          <span>{kmMaxDisponible.toLocaleString('es-AR')} km</span>
        </div>
      </div>
    </div>
  )
}