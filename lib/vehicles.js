// Fuente única de datos del stock. Se trae de la tabla `vehiculos` en
// Supabase. Las fotos viven en Supabase Storage, en la columna `imagenes`
// (array de URLs) — si un auto no tiene fotos cargadas ahí, simplemente
// no tiene fotos (ya no hay fallback a una carpeta local).

import { supabase } from './supabase'

export { precioNumerico } from './format'

// Genera un slug legible para la URL a partir de marca + modelo,
// ej: "Toyota" + "Corolla XEI CVT" -> "toyota-corolla-xei-cvt"
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Trae el stock completo desde Supabase y le agrega slug + imágenes.
export async function getStock() {
  const { data, error } = await supabase
    .from('vehiculos')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('Error al traer el stock desde Supabase:', error.message)
    return []
  }

  return data
    .filter((car) => car.disponibilidad !== 'Vendido')
    .map((car) => {
      const imagenes = car.imagenes || []
      const isZeroKm = car.km === 0 || Number(car.km) === 0
      const tipo = isZeroKm ? '0km' : (car.tipo && car.tipo.toLowerCase() !== '0km' ? car.tipo : 'Usado')
      return {
        ...car,
        tipo,
        slug: slugify(`${car.marca} ${car.modelo}`),
        imagenes,
        imagen: imagenes[0] || null,
      }
    })
}

export async function getVehicleBySlug(slug) {
  const stock = await getStock()
  return stock.find((car) => car.slug === slug)
}