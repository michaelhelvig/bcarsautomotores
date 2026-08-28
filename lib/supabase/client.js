import { createBrowserClient } from '@supabase/ssr'

// Cliente de Supabase para Client Components (formularios, botones con
// onClick, cualquier cosa que corra en el navegador). Guarda la sesión en
// cookies en vez de localStorage, para que el servidor también pueda
// leerla en el siguiente request.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
