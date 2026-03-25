/**
 * Fechas de visualización en formato **dd/mm/aaaa** (Argentina).
 * - `YYYY-MM-DD` (DATE de Postgres) sin usar `Date` (evita desfases por zona).
 * - ISO con hora: se usa la parte calendario inicial o `toLocaleDateString` si hace falta.
 */
export function formatDateDdMmYyyy(value: unknown): string {
  if (value === null || value === undefined) return '—'
  const s = String(value).trim()
  if (!s) return '—'

  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (plain) return `${plain[3]}/${plain[2]}/${plain[1]}`

  const prefix = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (prefix) return `${prefix[3]}/${prefix[2]}/${prefix[1]}`

  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
  return s
}
