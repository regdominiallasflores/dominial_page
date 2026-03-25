-- Carga inicial del superAdmin si app_user_roles quedó en 0 filas.
-- Se ejecuta en SQL Editor (rol postgres): no depende de RLS ni del navegador.
--
-- Si al ejecutar el INSERT ves "Success. No rows returned" y la tabla sigue vacía,
-- no hay ningún auth.users con ese email. Corré primero (solo lectura):
--   SELECT id, email FROM auth.users;
-- Usá el email real en el WHERE abajo, o creá el usuario en Authentication → Users
-- / logueate una vez en la app para que exista en auth.users.
--
-- Cambiá el email si tu cuenta bootstrap es otra (debe coincidir con el código).

INSERT INTO public.app_user_roles (user_id, role, display_name)
SELECT id, 'superAdmin', NULL
FROM auth.users
WHERE lower(email) = lower('regdominial@lasflores.gob.ar')
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role;
