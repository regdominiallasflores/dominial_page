/**
 * Valores solo para instanciar el cliente de Supabase cuando aún no hay .env.local.
 * Las peticiones fallarán hasta configurar URL y anon key reales en .env.local.
 */
const PLACEHOLDER_URL = 'https://configure-env-local.supabase.co'
/** JWT con formato válido (clave pública de ejemplo; no corresponde al proyecto placeholder). */
const PLACEHOLDER_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_ANON_KEY
}

/** `true` solo si hay URL y clave definidas en el entorno (no placeholders en runtime). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return Boolean(url && key)
}

/** Para mensajes de ayuda en desarrollo (no expone valores). */
export function getSupabaseEnvStatus(): { hasUrl: boolean; hasKey: boolean } {
  return {
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    hasKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
  }
}
