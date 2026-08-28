function SpecsColumn({ rows }) {
  return (
    <div className="bg-graphite-light rounded-2xl shadow-card border border-white/10 overflow-hidden">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center justify-between px-6 py-4 ${
            i !== rows.length - 1 ? 'border-b border-white/10' : ''
          }`}
        >
          <span className="text-sm font-semibold text-white/70">{row.label}</span>
          <span className="text-sm text-white">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function SpecsTable({ car }) {
  const isZeroKm = car.km === 0 || Number(car.km) === 0 || car.tipo?.toLowerCase() === '0km'
  const displayTipo = isZeroKm ? '0km' : (car.tipo || 'Usado')

  const left = [
    { label: 'Marca', value: car.marca },
    { label: 'Modelo', value: car.modelo },
    { label: 'Año', value: car.anio },
    { label: 'Condición', value: displayTipo },
    { label: 'Disponibilidad', value: car.disponibilidad || 'Disponible' },
  ]
  const right = [
    { label: 'Precio', value: car.precio },
    { label: 'Kilómetros', value: car.km === 0 ? '0 km' : `${car.km.toLocaleString('es-AR')} km` },
    { label: 'Combustible', value: car.combustible || '—' },
    { label: 'Transmisión', value: car.transmision || '—' },
    { label: 'Color', value: car.color || '—' },
  ]

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">Especificaciones</h2>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <SpecsColumn rows={left} />
        <SpecsColumn rows={right} />
      </div>
    </div>
  )
}
