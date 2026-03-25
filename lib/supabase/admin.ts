import { createClient } from '@supabase/supabase-js'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/credentials'

export const MISSING_SERVICE_ROLE_MESSAGE = 'Falta SUPABASE_SERVICE_ROLE_KEY en el entorno'

/** Texto para mostrar en la UI o en respuestas API cuando falta la clave. */
export const SERVICE_ROLE_SETUP_HINT =
  'En Supabase: Project Settings → API → copiá la clave "service_role" (secreto). Agregá en .env.local: SUPABASE_SERVICE_ROLE_KEY=tu_clave y reiniciá el servidor (pnpm dev).'

export function serviceRoleMissingResponseBody() {
  return {
    error: MISSING_SERVICE_ROLE_MESSAGE,
    errorCode: 'MISSING_SERVICE_ROLE_KEY' as const,
    hint: SERVICE_ROLE_SETUP_HINT,
  }
}

/**
 * La gestión de usuarios (listar, crear, eliminar en Auth) requiere la clave service_role en el servidor.
 * No la expongas con prefijo NEXT_PUBLIC_ ni la incluyas en el cliente.
 */
export function isSupabaseServiceRoleConfigured() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
}

/**
 * Cliente de Supabase con privilegios (service role).
 * Requiere que definas `SUPABASE_SERVICE_ROLE_KEY` en el entorno.
 *
 * Nota: no se debe exponer esta clave al navegador.
 */
export function getSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey?.trim()) {
    throw new Error(MISSING_SERVICE_ROLE_MESSAGE)
  }

  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })
}

/**
 * Alias para mantener compatibilidad si en algún lugar se necesita el anon key.
 * No se usa para admin operations.
 */
export function getSupabaseAnonClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { persistSession: false },
  })
}

