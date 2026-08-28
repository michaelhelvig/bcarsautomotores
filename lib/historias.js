// Fuente de datos de la sección "Entregas Reales" (fotos de historias de
// Instagram cargadas a mano desde el panel). A diferencia de `vehiculos`,
// acá no hace falta una fila por foto: todo el set vive como un array en
// una única fila (id=1) de `historias_clientes`, igual que la columna
// `imagenes` de un vehículo — mismo patrón, una sola vez.

import { supabase } from './supabase'

export async function getHistorias() {
  const { data, error } = await supabase
    .from('historias_clientes')
    .select('items')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.error('Error al traer las historias desde Supabase:', error.message)
    return []
  }

  return data?.items || []
}
