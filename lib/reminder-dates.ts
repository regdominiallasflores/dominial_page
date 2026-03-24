/**
 * Días de calendario desde hoy hasta la fecha del recordatorio (YYYY-MM-DD).
 * 0 = hoy, 1 = mañana, negativo = ya pasó.
 * Misma lógica que `app/api/stats/route.ts` y criterio de urgencia del dashboard.
 */
export function calendarDaysFromToday(fechaStr: string): number {
  const parts = fechaStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return 999
  const [y, m, d] = parts
  const target = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

/** Urgente: hoy, mañana o vencido — igual que la card de Recordatorios en inicio (`recordatoriosUrgentes`). */
export function isReminderDateUrgent(fechaRecordatorio: string): boolean {
  return calendarDaysFromToday(fechaRecordatorio) <= 1
}
