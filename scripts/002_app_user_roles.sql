-- Roles de aplicación y RLS mínima para /admin/users y useAppRole.
-- Ejecutar en Supabase → SQL Editor si aparece PGRST205 (tabla no encontrada).
-- Ajustá el email si usás otro superAdmin bootstrap (debe coincidir con el código).

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
    AND EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
        AND lower(email) = lower('regdominial@lasflores.gob.ar')
    )
  );
