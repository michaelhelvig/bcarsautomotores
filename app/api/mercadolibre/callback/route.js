import { NextResponse } from 'next/server'

import { exchangeCodeForToken } from '@/lib/mercadolibre/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request) {
    const { searchParams } = new URL(request.url)

    const code = searchParams.get('code')

    const codeVerifier = request.cookies.get(
        'meli_code_verifier',
    )?.value

    const appUrl =
        request.cookies.get('meli_app_url')?.value ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000'

    const dashboardUrl = new URL('/panel/vehiculos', appUrl)

    if (!code || !codeVerifier) {
        console.error(
            'Falta el código de autorización o el code_verifier.',
            {
                hasCode: Boolean(code),
                hasCodeVerifier: Boolean(codeVerifier),
                appUrl,
            },
        )

        dashboardUrl.searchParams.set('meli', 'error')

        const response = NextResponse.redirect(dashboardUrl)

        response.cookies.delete('meli_code_verifier')
        response.cookies.delete('meli_app_url')

        return response
    }

    try {
        const token = await exchangeCodeForToken(
            code,
            codeVerifier,
        )

        const expiresAt = new Date(
            Date.now() + token.expires_in * 1000,
        ).toISOString()

        const { error } = await supabaseAdmin
            .from('mercadolibre_tokens')
            .upsert(
                {
                    user_id: String(token.user_id),
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    expires_at: expiresAt,
                },
                {
                    onConflict: 'user_id',
                },
            )

        if (error) {
            throw new Error(error.message)
        }

        dashboardUrl.searchParams.set('meli', 'connected')

        const response = NextResponse.redirect(dashboardUrl)

        response.cookies.delete('meli_code_verifier')
        response.cookies.delete('meli_app_url')

        return response
    } catch (error) {
        console.error(
            'Error en callback de Mercado Libre:',
            error,
        )

        dashboardUrl.searchParams.set('meli', 'error')

        const response = NextResponse.redirect(dashboardUrl)

        response.cookies.delete('meli_code_verifier')
        response.cookies.delete('meli_app_url')

        return response
    }
}