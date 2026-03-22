/**
 * Texto legible para errores de Supabase/PostgREST y fallos de red (`fetch`).
 */

function firstLine(text: string): string {
  const line = text.split('\n')[0]?.trim()
  return line ?? text
}

/** Quita stack tipo " at http://..." que ensucia la UI. */
function stripBrowserStack(msg: string): string {
  const atHttp = msg.search(/\s+at\s+(?:http|https):\/\//i)
  if (atHttp > 0) return msg.slice(0, atHttp).trim()
  return firstLine(msg)
}

function extractRawMessage(err: unknown): string {
  if (err == null) return ''
  if (typeof err === 'string') return err
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>
    if (typeof o.message === 'string' && o.message.length) return o.message
    if (typeof o.details === 'string' && o.details.length) return o.details
  }
  if (err instanceof Error) return err.message
  try {
    const s = JSON.stringify(err)
    if (s !== '{}') return s
  } catch {
    /* ignore */
  }
  try {
    return String(err)
  } catch {
    return ''
  }
}

/** Junta todo lo legible del error (algunos objetos serializan como `{}` en JSON pero tienen message). */
function collectSearchableText(err: unknown): string {
  const parts: string[] = [extractRawMessage(err)]
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>
    for (const key of ['message', 'details', 'hint', 'code'] as const) {
      const v = o[key]
      if (typeof v === 'string') parts.push(v)
    }
  }
  try {
    parts.push(String(err))
  } catch {
    /* ignore */
  }
  return parts.join('\n')
}

function isNetworkFetchFailure(text: string): boolean {
  const t = text.toLowerCase()
  return (
    t.includes('failed to fetch') ||
    t.includes('networkerror') ||
    t.includes('load failed') ||
    t.includes('network request failed')
  )
}

const FETCH_FAILURE_HELP =
  'No hubo conexión con Supabase. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en `.env.local` (deben coincidir con Settings → API), guarda y reinicia `pnpm dev`. Comprueba también firewall, VPN y que el proyecto siga activo en Supabase.'

const EXTENSION_HINT =
  ' Si el error menciona `eval` o código raro (`_0x…`), suele ser una extensión del navegador interceptando `fetch`: prueba en incógnito sin extensiones o desactiva bloqueadores en localhost.'

export function formatSupabaseError(err: unknown): string {
  const blob = collectSearchableText(err)

  if (isNetworkFetchFailure(blob)) {
    if (/eval at|_0x[0-9a-f]{4,}/i.test(blob)) {
      return FETCH_FAILURE_HELP + EXTENSION_HINT
    }
    return FETCH_FAILURE_HELP
  }

  if (err == null) return 'Error desconocido'
  if (typeof err === 'string') return stripBrowserStack(err) || err

  if (typeof err === 'object') {
    const o = err as Record<string, unknown>
    const msgRaw = typeof o.message === 'string' ? o.message : ''
    const msg = msgRaw ? stripBrowserStack(msgRaw) : ''
    const code = o.code
    const details = o.details
    const hint = o.hint
    const parts: string[] = []
    if (msg) parts.push(msg)
    if (typeof code === 'string') parts.push(`[${code}]`)
    if (typeof details === 'string' && details.length) parts.push(stripBrowserStack(details))
    if (typeof hint === 'string' && hint.length) parts.push(`Sugerencia: ${hint}`)
    if (parts.length) return parts.join(' ')
  }

  if (err instanceof Error) return stripBrowserStack(err.message) || err.message
  const fallback = stripBrowserStack(blob)
  return fallback || 'Error desconocido'
}
