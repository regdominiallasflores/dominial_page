import type { SupabaseClient } from '@supabase/supabase-js'

export type AppRole = 'superAdmin' | 'admin' | 'user'

const BOOTSTRAP_SUPERADMIN_EMAIL = 'regdominial@lasflores.gob.ar'

/**
 * Obtiene el rol del usuario actual usando el cliente Supabase **con sesión** (cookies).
 * Así RLS (`user_id = auth.uid()`) coincide con lo que ya funciona en el navegador.
 * No usar el cliente service_role solo para esto: con clave equivocada el SELECT falla
 * aunque la UI muestre bien el rol.
 */
export async function getCallerRoleOrBootstrap(
  supabaseUser: SupabaseClient,
  params: { userId: string; email?: string | null },
): Promise<AppRole | null> {
  const { data: roleRow, error } = await supabaseUser
    .from('app_user_roles')
    .select('role')
    .eq('user_id', params.userId)
    .maybeSingle()

  if (error) {
    throw new Error(
      `No se pudo obtener rol: ${error.message}${error.code ? ` (${error.code})` : ''}`,
    )
  }
  if (roleRow?.role) return roleRow.role as AppRole

  if ((params.email ?? '').toLowerCase() === BOOTSTRAP_SUPERADMIN_EMAIL.toLowerCase()) {
    const { error: insertErr } = await supabaseUser.from('app_user_roles').insert({
      user_id: params.userId,
      role: 'superAdmin',
      display_name: null,
    })
    if (insertErr) {
      throw new Error(
        `No se pudo bootstrappear rol: ${insertErr.message}${insertErr.code ? ` (${insertErr.code})` : ''}`,
      )
    }
    return 'superAdmin'
  }

  return null
}
