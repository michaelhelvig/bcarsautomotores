import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente de Supabase para Server Components, Server Actions y Route
// Handlers. Lee la sesión desde las cookies de la request entrante, así
// el servidor sabe si hay un usuario logueado y quién es.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // `set` puede fallar si se llama desde un Server Component
            // (no se pueden escribir cookies ahí, solo leerlas). No pasa
            // nada: el middleware de abajo se encarga de refrescar la
            // sesión en cada request.
          }
        },
      },
    },
  )
}
