import { createClient } from '@/lib/supabase/client'

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
