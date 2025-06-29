import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

export function getSupabaseClient() {
  if (_client) return _client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ykmonkeyckzpcbxihpvz.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbW9ua2V5Y2t6cGNieGlocHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTkyMzcsImV4cCI6MjA2NjE5NTIzN30.Ff3S5csIJlZqoewBTJDgWPFr7RfXLYNdREGDavHzGOc"

  _client = createClient(supabaseUrl, supabaseAnonKey)
  return _client
}

export const supabase = getSupabaseClient()
