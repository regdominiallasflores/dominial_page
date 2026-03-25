/** Texto de ayuda para respuestas JSON cuando el fallo es reconocible. */
export function hintForSupabaseError(message: string): string | undefined {
  if (message.includes('PGRST205') || /app_user_roles/i.test(message)) {
    return 'En el proyecto Supabase que usás en .env.local: SQL Editor → ejecutá scripts/002_app_user_roles.sql (repo). Eso crea public.app_user_roles. Si el error sigue, comprobá que la URL y las claves sean del mismo proyecto donde corrés el SQL.'
  }
  return undefined
}
