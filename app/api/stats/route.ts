import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calendarDaysFromToday } from '@/lib/reminder-dates'

export async function GET() {
  try {
    const supabase = await createClient()

    const [recepcion, personaJuridica, afectacion, leyPierri, recordatoriosPending] = await Promise.all([
      supabase.from('recepcion').select('id', { count: 'exact', head: true }),
      supabase.from('persona_juridica').select('id', { count: 'exact', head: true }),
      supabase.from('afectacion').select('id', { count: 'exact', head: true }),
      supabase.from('ley_pierri').select('id', { count: 'exact', head: true }),
      supabase
        .from('recordatorios')
        .select('fecha_recordatorio', { count: 'exact' })
        .eq('completado', false),
    ])

    const pendingRows = recordatoriosPending.data ?? []
    const recordatoriosUrgentes = pendingRows.some((row) => {
      const days = calendarDaysFromToday(row.fecha_recordatorio)
      return days <= 1
    })

    return NextResponse.json({
      recepcion: recepcion.count ?? 0,
      personaJuridica: personaJuridica.count ?? 0,
      afectacion: afectacion.count ?? 0,
      leyPierri: leyPierri.count ?? 0,
      recordatorios: recordatoriosPending.count ?? pendingRows.length,
      recordatoriosUrgentes,
    })
  } catch (err) {
    console.error('Error fetching stats:', err)
    return NextResponse.json({
      recepcion: 0,
      personaJuridica: 0,
      afectacion: 0,
      leyPierri: 0,
      recordatorios: 0,
      recordatoriosUrgentes: false,
    })
  }
}
