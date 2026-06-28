import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Cookieless anon client for PUBLIC SSR/ISR pages. Because it never touches
// cookies()/headers(), it does NOT opt routes into dynamic rendering — pages
// keep their `revalidate` ISR / static behaviour. RLS `public_read_*` policies
// (status = 'published') allow anon SELECT. Memoised: one client per server
// process, reused across requests (no per-request session needed).
let publicClient: SupabaseClient<Database> | null = null

export function createPublicSupabase(): SupabaseClient<Database> {
  if (!publicClient) {
    publicClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )
  }
  return publicClient
}
