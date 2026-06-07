import { createClient } from "@supabase/supabase-js"

// Server-side calls talk to Supabase directly over the internal address (fast,
// and independent of the public domain / Cloudflare). Falls back to the public
// URL when no internal URL is configured (e.g. local dev without the split).
const supabaseUrl = process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Storage public URLs are persisted in the DB and loaded by browsers, so they
// must use the PUBLIC base URL, not the internal one used for the upload call.
export function publicStorageUrl(bucket: string, path: string) {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl).replace(/\/+$/, "")
  return `${base}/storage/v1/object/public/${bucket}/${path}`
}

// Server-side Supabase client with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Export as 'supabase' for backward compatibility with existing API routes
export const supabase = supabaseAdmin
