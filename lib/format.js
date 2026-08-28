// Funciones puras de formato, sin ninguna dependencia de Supabase a
// propósito: esto es lo que se debe importar desde Client Components
// ('use client'). Si alguna de estas funciones viviera en lib/vehicles.js
// (que sí importa el cliente de Supabase), cualquier componente del
// navegador que la use arrastraría también la creación de ese cliente al
// bundle del navegador — generando una segunda instancia de GoTrueClient
// además de la que ya usan login/panel, con el warning de "Multiple
// GoTrueClient instances".

// Extrae el valor numérico de un precio guardado como texto
// (ej: "ARS 9.900.000" -> 9900000). Solo se usa para poder ORDENAR por
// precio; en ningún momento convertimos entre monedas ni mostramos el
// número solo — el precio siempre se muestra tal cual viene de MercadoLibre
// (con su moneda), para no meternos en el tema de USD/ARS.
export function precioNumerico(car) {
  const match = String(car.precio || '').replace(/\./g, '').match(/\d+/)
  return match ? Number(match[0]) : 0
}

// Extrae la moneda de un precio guardado como texto (ej: "USD 21.500" -> "USD").
// Si no hay moneda explícita, asumimos ARS.
function monedaDePrecio(car) {
  const match = String(car.precio || '').trim().match(/^([A-Za-z]{2,4})/)
  return match ? match[1].toUpperCase() : 'ARS'
}

// Suma el valor del stock agrupado por moneda (nunca mezclamos USD con ARS
// en un solo total, por la misma razón que precioNumerico no convierte
// entre monedas). Devuelve algo como:
// [{ moneda: 'USD', monto: 45000, texto: 'USD 45.000' }, ...]
export function valorStockPorMoneda(cars) {
  const totales = {}

  for (const car of cars) {
    const moneda = monedaDePrecio(car)
    const monto = precioNumerico(car)
    if (monto <= 0) continue
    totales[moneda] = (totales[moneda] || 0) + monto
  }

  return Object.entries(totales).map(([moneda, monto]) => ({
    moneda,
    monto,
    texto: `${moneda} ${monto.toLocaleString('es-AR')}`,
  }))
}