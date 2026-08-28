import { NextResponse } from 'next/server'

import {
  generateCodeVerifier,
  generateCodeChallenge,
  getAuthorizationUrl,
} from '@/lib/mercadolibre/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)

    // Detectamos desde qué dominio se inició el flujo.
    const forwardedHost =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host')

    const forwardedProto =
      request.headers.get('x-forwarded-proto') ||
      'http'

    const appUrl = `${forwardedProto}://${forwardedHost}`

    const response = NextResponse.redirect(
      getAuthorizationUrl(codeChallenge),
    )

    // Guardamos el verifier para que vuelva cuando Mercado Libre
    // redirija al callback.
    response.cookies.set('meli_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    })

    // Guardamos también desde dónde se inició el flujo.
    response.cookies.set('meli_app_url', appUrl, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error iniciando autorización de Mercado Libre:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error iniciando autorización.',
      },
      { status: 500 },
    )
  }
}