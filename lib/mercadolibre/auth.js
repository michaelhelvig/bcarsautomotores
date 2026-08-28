import crypto from 'crypto'

const AUTH_URL = 'https://auth.mercadolibre.com.ar/authorization'
const TOKEN_URL = 'https://api.mercadolibre.com/oauth/token'

function getConfig() {
  const clientId = process.env.MERCADOLIBRE_CLIENT_ID
  const clientSecret = process.env.MERCADOLIBRE_CLIENT_SECRET
  const redirectUri = process.env.MERCADOLIBRE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Faltan variables de entorno de Mercado Libre.')
  }

  return { clientId, clientSecret, redirectUri }
}

export function generateCodeVerifier() {
  return crypto.randomBytes(64).toString('base64url')
}

export function generateCodeChallenge(codeVerifier) {
  return crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
}

export function getAuthorizationUrl(codeChallenge) {
  const { clientId, redirectUri } = getConfig()

  const url = new URL(AUTH_URL)

  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)

  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')

  return url.toString()
}

export async function exchangeCodeForToken(code, codeVerifier) {
  const { clientId, clientSecret, redirectUri } = getConfig()

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  })

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'No se pudo obtener el token de Mercado Libre.',
    )
  }

  return data
}

export async function refreshAccessToken(refreshToken) {
  const { clientId, clientSecret } = getConfig()

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  })

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'No se pudo renovar el token de Mercado Libre.',
    )
  }

  return data
}