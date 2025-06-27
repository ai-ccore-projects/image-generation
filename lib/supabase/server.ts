import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ykmonkeyckzpcbxihpvz.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbW9ua2V5Y2t6cGNieGlocHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTkyMzcsImV4cCI6MjA2NjE5NTIzN30.Ff3S5csIJlZqoewBTJDgWPFr7RfXLYNdREGDavHzGOc"

// Use service role if available, fallback to anon key
const keyToUse = supabaseServiceKey || supabaseAnonKey

if (!keyToUse) {
  console.error('No Supabase key available - check environment variables')
}

// Server-side Supabase client with fallback
export const supabaseAdmin = createClient(supabaseUrl, keyToUse, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Export as 'supabase' for backward compatibility with existing API routes
export const supabase = supabaseAdmin

// Function to create server Supabase client - used by API routes
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
