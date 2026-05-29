import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _adminClient: SupabaseClient | null = null

export function getSupabaseAdmin() {
  if (_adminClient) return _adminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase server client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  }

  _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _adminClient
}

// Server-side Supabase client with service role
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    return getSupabaseAdmin()[property as keyof SupabaseClient]
  },
})

// Export as 'supabase' for backward compatibility with existing API routes
export const supabase = supabaseAdmin
