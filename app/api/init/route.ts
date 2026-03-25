import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

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
          link_documentacion TEXT,
          ubicacion TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE public.persona_juridica
          ADD COLUMN IF NOT EXISTS link_documentacion TEXT;

        ALTER TABLE public.persona_juridica
          ADD COLUMN IF NOT EXISTS ubicacion TEXT;

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
          ubicacion TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE public.afectacion
          ADD COLUMN IF NOT EXISTS ubicacion TEXT;

        CREATE TABLE IF NOT EXISTS ley_pierri (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          fecha_ingreso DATE,
          beneficiarios TEXT,
          direccion TEXT,
          telefono TEXT,
          observaciones TEXT,
          link_documentacion TEXT,
          estado TEXT DEFAULT 'Oficina',
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

        -- ---------------------------------------------------------------------
        -- Autenticación / Autorización por roles (RLS)
        -- ---------------------------------------------------------------------

        CREATE TABLE IF NOT EXISTS public.app_user_roles (
          user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('superAdmin', 'admin', 'user')),
          display_name TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Si la tabla ya existía sin la columna display_name, la agregamos.
        ALTER TABLE public.app_user_roles
          ADD COLUMN IF NOT EXISTS display_name TEXT;

        CREATE OR REPLACE FUNCTION public.current_app_role()
        RETURNS TEXT
        LANGUAGE sql
        STABLE
        AS $$
          SELECT role
          FROM public.app_user_roles
          WHERE user_id = auth.uid()
        $$;

        -- Roles
        ALTER TABLE public.app_user_roles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS app_user_roles_select_own ON public.app_user_roles;
        CREATE POLICY app_user_roles_select_own
          ON public.app_user_roles
          FOR SELECT
          USING (user_id = auth.uid());

        -- Bootstrap automático: el primer (y único) superAdmin se asigna
        -- cuando loguea con el email provisto.
        DROP POLICY IF EXISTS app_user_roles_insert_superadmin_bootstrap ON public.app_user_roles;
        CREATE POLICY app_user_roles_insert_superadmin_bootstrap
          ON public.app_user_roles
          FOR INSERT
          WITH CHECK (
            role = 'superAdmin'
            AND user_id = auth.uid()
            AND lower(coalesce(auth.jwt() ->> 'email', '')) = lower('regdominial@lasflores.gob.ar')
          );

        -- ---------------------------------------------------------------------
        -- Negocio: lecturas permitidas a todos los roles autenticados.
        -- Escrituras (insert/update/delete) solo para admin/superAdmin.
        -- ---------------------------------------------------------------------

        ALTER TABLE public.recepcion ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS recepcion_select_authenticated ON public.recepcion;
        DROP POLICY IF EXISTS recepcion_write_admins ON public.recepcion;
        DROP POLICY IF EXISTS recepcion_update_admins ON public.recepcion;
        DROP POLICY IF EXISTS recepcion_delete_admins ON public.recepcion;

        CREATE POLICY recepcion_select_authenticated
          ON public.recepcion
          FOR SELECT
          USING (public.current_app_role() IN ('superAdmin', 'admin', 'user'));
        CREATE POLICY recepcion_write_admins
          ON public.recepcion
          FOR INSERT
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY recepcion_update_admins
          ON public.recepcion
          FOR UPDATE
          USING (public.current_app_role() IN ('superAdmin', 'admin'))
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY recepcion_delete_admins
          ON public.recepcion
          FOR DELETE
          USING (public.current_app_role() IN ('superAdmin', 'admin'));

        ALTER TABLE public.persona_juridica ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS persona_juridica_select_authenticated ON public.persona_juridica;
        DROP POLICY IF EXISTS persona_juridica_write_admins ON public.persona_juridica;
        DROP POLICY IF EXISTS persona_juridica_update_admins ON public.persona_juridica;
        DROP POLICY IF EXISTS persona_juridica_delete_admins ON public.persona_juridica;

        CREATE POLICY persona_juridica_select_authenticated
          ON public.persona_juridica
          FOR SELECT
          USING (public.current_app_role() IN ('superAdmin', 'admin', 'user'));
        CREATE POLICY persona_juridica_write_admins
          ON public.persona_juridica
          FOR INSERT
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY persona_juridica_update_admins
          ON public.persona_juridica
          FOR UPDATE
          USING (public.current_app_role() IN ('superAdmin', 'admin'))
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY persona_juridica_delete_admins
          ON public.persona_juridica
          FOR DELETE
          USING (public.current_app_role() IN ('superAdmin', 'admin'));

        ALTER TABLE public.afectacion ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS afectacion_select_authenticated ON public.afectacion;
        DROP POLICY IF EXISTS afectacion_write_admins ON public.afectacion;
        DROP POLICY IF EXISTS afectacion_update_admins ON public.afectacion;
        DROP POLICY IF EXISTS afectacion_delete_admins ON public.afectacion;

        CREATE POLICY afectacion_select_authenticated
          ON public.afectacion
          FOR SELECT
          USING (public.current_app_role() IN ('superAdmin', 'admin', 'user'));
        CREATE POLICY afectacion_write_admins
          ON public.afectacion
          FOR INSERT
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY afectacion_update_admins
          ON public.afectacion
          FOR UPDATE
          USING (public.current_app_role() IN ('superAdmin', 'admin'))
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY afectacion_delete_admins
          ON public.afectacion
          FOR DELETE
          USING (public.current_app_role() IN ('superAdmin', 'admin'));

        ALTER TABLE public.ley_pierri ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS ley_pierri_select_authenticated ON public.ley_pierri;
        DROP POLICY IF EXISTS ley_pierri_write_admins ON public.ley_pierri;
        DROP POLICY IF EXISTS ley_pierri_update_admins ON public.ley_pierri;
        DROP POLICY IF EXISTS ley_pierri_delete_admins ON public.ley_pierri;

        CREATE POLICY ley_pierri_select_authenticated
          ON public.ley_pierri
          FOR SELECT
          USING (public.current_app_role() IN ('superAdmin', 'admin', 'user'));
        CREATE POLICY ley_pierri_write_admins
          ON public.ley_pierri
          FOR INSERT
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY ley_pierri_update_admins
          ON public.ley_pierri
          FOR UPDATE
          USING (public.current_app_role() IN ('superAdmin', 'admin'))
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY ley_pierri_delete_admins
          ON public.ley_pierri
          FOR DELETE
          USING (public.current_app_role() IN ('superAdmin', 'admin'));

        ALTER TABLE public.recordatorios ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS recordatorios_select_authenticated ON public.recordatorios;
        DROP POLICY IF EXISTS recordatorios_write_admins ON public.recordatorios;
        DROP POLICY IF EXISTS recordatorios_update_admins ON public.recordatorios;
        DROP POLICY IF EXISTS recordatorios_delete_admins ON public.recordatorios;

        CREATE POLICY recordatorios_select_authenticated
          ON public.recordatorios
          FOR SELECT
          USING (public.current_app_role() IN ('superAdmin', 'admin', 'user'));
        CREATE POLICY recordatorios_write_admins
          ON public.recordatorios
          FOR INSERT
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY recordatorios_update_admins
          ON public.recordatorios
          FOR UPDATE
          USING (public.current_app_role() IN ('superAdmin', 'admin'))
          WITH CHECK (public.current_app_role() IN ('superAdmin', 'admin'));
        CREATE POLICY recordatorios_delete_admins
          ON public.recordatorios
          FOR DELETE
          USING (public.current_app_role() IN ('superAdmin', 'admin'));
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
