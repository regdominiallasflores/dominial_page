import { createClient } from '@/lib/supabase/client'
import { isReminderDateUrgent } from '@/lib/reminder-dates'

/** Datos del recordatorio pendiente más reciente por registro (para resaltar campana y edición). */
export type PendingReminderInfo = {
  reminderId: string
  titulo: string
  descripcion: string
  fecha_recordatorio: string
}

export async function getPendingRemindersByRegistro(
  tablaOrigen: string,
  registroIds: string[],
): Promise<Map<string, PendingReminderInfo>> {
  if (registroIds.length === 0) return new Map()
  const supabase = createClient()
  const { data, error } = await supabase
    .from('recordatorios')
    .select('id, registro_id, titulo, descripcion, fecha_recordatorio')
    .eq('tabla_origen', tablaOrigen)
    .eq('completado', false)
    .in('registro_id', registroIds)
    .order('created_at', { ascending: false })

  if (error) throw error
  const map = new Map<string, PendingReminderInfo>()
  for (const row of data || []) {
    const rid = String(row.registro_id)
    if (map.has(rid)) continue
    map.set(rid, {
      reminderId: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion ?? '',
      fecha_recordatorio: row.fecha_recordatorio,
    })
  }
  return map
}

export function isPendingReminderUrgent(info: PendingReminderInfo | undefined): boolean {
  if (!info?.fecha_recordatorio) return false
  return isReminderDateUrgent(info.fecha_recordatorio)
}

/**
 * Recordatorio pendiente lejano: verde, campana blanca, sin animación.
 * @see `.reminder-bell-active-btn` en `globals.css`
 */
export const REMINDER_BELL_ACTIVE_BUTTON_CLASS = 'reminder-bell-active-btn'

/**
 * Hoy, mañana o vencido (`días <= 1`): rojo como la card de inicio, campana blanca, animación tipo dashboard.
 * @see `.reminder-bell-urgent-btn` en `globals.css`
 */
export const REMINDER_BELL_URGENT_BUTTON_CLASS = 'reminder-bell-urgent-btn'

/** Clases del botón campana según haya recordatorio y si la fecha es urgente (`días <= 1`). */
export function getReminderBellButtonClass(
  pendingReminders: Map<string, PendingReminderInfo>,
  registroId: string,
): string | undefined {
  const info = pendingReminders.get(registroId)
  if (!info) return undefined
  return isPendingReminderUrgent(info)
    ? REMINDER_BELL_URGENT_BUTTON_CLASS
    : REMINDER_BELL_ACTIVE_BUTTON_CLASS
}
