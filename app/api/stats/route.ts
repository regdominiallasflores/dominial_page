import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch counts from each table
    const [recepcion, personaJuridica, afectacion, leyPierri, recordatorios] = await Promise.all([
      supabase.from('recepcion').select('id', { count: 'exact', head: true }),
      supabase.from('persona_juridica').select('id', { count: 'exact', head: true }),
      supabase.from('afectacion').select('id', { count: 'exact', head: true }),
      supabase.from('ley_pierri').select('id', { count: 'exact', head: true }),
      supabase.from('recordatorios').select('id', { count: 'exact', head: true, eq: 'completado.is.false' })
    ])

    return NextResponse.json({
      recepcion: recepcion.count || 0,
      personaJuridica: personaJuridica.count || 0,
      afectacion: afectacion.count || 0,
      leyPierri: leyPierri.count || 0,
      recordatorios: recordatorios.count || 0
    })
  } catch (err) {
    console.error('Error fetching stats:', err)
    return NextResponse.json({
      recepcion: 0,
      personaJuridica: 0,
      afectacion: 0,
      leyPierri: 0,
      recordatorios: 0
    })
  }
}
