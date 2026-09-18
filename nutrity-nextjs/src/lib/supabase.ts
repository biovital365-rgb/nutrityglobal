import 'server-only'
import { createClient } from '@supabase/supabase-js'

function publicCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Supabase public credentials are not configured')
  return { url, anonKey }
}

export function getSupabaseAdmin() {
  const { url } = publicCredentials()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

export const getAuthenticatedSupabaseClient = (firebaseToken: string) => {
  const { url, anonKey } = publicCredentials()
  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${firebaseToken}`,
      },
    },
  })
}
