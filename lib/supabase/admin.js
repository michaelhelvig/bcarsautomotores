import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL.')
}

if (!supabaseSecretKey) {
  throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY.')
}

console.log(
  '[Supabase Admin] Key cargada:',
  supabaseSecretKey.startsWith('sb_secret_')
    ? 'Secret Key'
    : 'OTRO TIPO DE KEY',
)

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
)