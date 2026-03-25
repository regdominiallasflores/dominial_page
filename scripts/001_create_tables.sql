-- Tabla Recepción
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

-- Tabla Persona Jurídica
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

ALTER TABLE persona_juridica
  ADD COLUMN IF NOT EXISTS link_documentacion TEXT;

ALTER TABLE persona_juridica
  ADD COLUMN IF NOT EXISTS ubicacion TEXT;

-- Tabla Afectación
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

ALTER TABLE afectacion
  ADD COLUMN IF NOT EXISTS ubicacion TEXT;

-- Tabla Ley Pierri
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

-- Tabla Recordatorios
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

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_recepcion_estado ON recepcion(estado);
CREATE INDEX IF NOT EXISTS idx_recepcion_fecha ON recepcion(fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_persona_juridica_expediente ON persona_juridica(expediente);
CREATE INDEX IF NOT EXISTS idx_afectacion_expediente ON afectacion(expediente);
CREATE INDEX IF NOT EXISTS idx_ley_pierri_estado ON ley_pierri(estado);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha ON recordatorios(fecha_recordatorio);
CREATE INDEX IF NOT EXISTS idx_recordatorios_completado ON recordatorios(completado);

-- ---------------------------------------------------------------------------
-- Roles de aplicación (/admin/users). Mismo contenido que scripts/002_app_user_roles.sql
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.app_user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('superAdmin', 'admin', 'user')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

ALTER TABLE public.app_user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_user_roles_select_own ON public.app_user_roles;
CREATE POLICY app_user_roles_select_own
  ON public.app_user_roles
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS app_user_roles_insert_superadmin_bootstrap ON public.app_user_roles;
CREATE POLICY app_user_roles_insert_superadmin_bootstrap
  ON public.app_user_roles
  FOR INSERT
  WITH CHECK (
    role = 'superAdmin'
    AND user_id = auth.uid()
    AND lower(coalesce(auth.jwt() ->> 'email', '')) = lower('regdominial@lasflores.gob.ar')
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_user_roles TO authenticated;
