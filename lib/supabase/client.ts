import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/credentials'

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { persistSession: false },
  })
}
