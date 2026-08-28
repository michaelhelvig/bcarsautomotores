import { createClient } from '@supabase/supabase-js'

// Cliente simple de Supabase, sin manejo de sesión por cookies. Se usa
// solo para lectura pública del catálogo (lib/vehicles.js) — no requiere
// saber quién está logueado, así que no hace falta @supabase/ssr acá.
//
// Para todo lo que sí dependa de sesión (login, dashboard, escritura),
// usar lib/supabase/client.js (Client Components) o
// lib/supabase/server.js (Server Components / Server Actions).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)