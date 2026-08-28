import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Corre antes de cada request (esto es lo que antes se llamaba
// "middleware.js" — Next.js 16 lo renombró a "proxy.js", mismo
// comportamiento). Hace dos cosas:
//   1. Refresca el token de sesión de Supabase si está por vencer.
//   2. Protege /panel: si no hay usuario logueado, redirige a /login.
//      Y si ya está logueado y visita /login, lo manda directo al panel.
export default async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Importante: no borrar esta línea. getUser() es lo que efectivamente
  // dispara el refresh del token si está por vencer — si solo se lee la
  // sesión sin llamar a esto, el refresh nunca pasa.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && pathname.startsWith('/panel')) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === '/login') {
    const dashboardUrl = new URL('/panel', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}