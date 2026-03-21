import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Create tables
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS recepcion (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          fecha_ingreso DATE,
          apellido_nombre TEXT,
          direccion TEXT,
          telefono TEXT,
          tema TEXT,
          descripcion TEXT,
          estado TEXT DEFAULT 'Pendiente',
          observaciones TEXT,
          fecha_resolucion DATE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS persona_juridica (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ingreso DATE,
          legajo TEXT,
          expediente TEXT,
          denominacion TEXT,
          tramite TEXT,
          resolucion TEXT,
          fecha_resolucion DATE,
          observaciones TEXT,
          notificado BOOLEAN DEFAULT FALSE,
          representante TEXT,
          telefono TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS afectacion (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          fecha_ingreso DATE,
          expediente TEXT,
          afectante TEXT,
          link_documentacion TEXT,
          estado TEXT DEFAULT 'Pendiente',
          fecha_resolucion DATE,
          link_descarga TEXT,
          observaciones TEXT,
          notificado BOOLEAN DEFAULT FALSE,
          representante TEXT,
          telefono TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS ley_pierri (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          fecha_ingreso DATE,
          beneficiarios TEXT,
          direccion TEXT,
          telefono TEXT,
          observaciones TEXT,
          link_documentacion TEXT,
          estado TEXT DEFAULT 'Pendiente',
          enviado BOOLEAN DEFAULT FALSE,
          fecha_envio DATE,
          escribania TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS recordatorios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          titulo TEXT NOT NULL,
          descripcion TEXT,
          fecha_recordatorio DATE NOT NULL,
          tabla_origen TEXT,
          registro_id UUID,
          completado BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })

    if (error) {
      console.error('Error creating tables:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Tables initialized successfully' })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Failed to initialize tables' }, { status: 500 })
  }
}
