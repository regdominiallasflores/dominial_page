/**
 * Texto legible para errores de Supabase/PostgREST.
 * Esos objetos a menudo serializan como `{}` en console.error.
 */
export function formatSupabaseError(err: unknown): string {
  if (err == null) return 'Error desconocido'
  if (typeof err === 'string') return err
  if (typeof err === 'object') {
    const o = err as Record<string, unknown>
    const msg = o.message
    const code = o.code
    const details = o.details
    const hint = o.hint
    const parts: string[] = []
    if (typeof msg === 'string') parts.push(msg)
    if (typeof code === 'string') parts.push(`[${code}]`)
    if (typeof details === 'string' && details.length) parts.push(details)
    if (typeof hint === 'string' && hint.length) parts.push(`Sugerencia: ${hint}`)
    if (parts.length) return parts.join(' ')
  }
  if (err instanceof Error) return err.message
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}
