# Dominial

Aplicación web (**Next.js**) para la gestión de expedientes de la Dirección de Regularización Dominial y Persona Jurídica (Municipalidad de Las Flores). El código se generó inicialmente con [v0](https://v0.app) y el backend de datos usa [Supabase](https://supabase.com).

## Requisitos

- **Node.js** 20 o superior (recomendado LTS actual).
- **pnpm** 10.x (el repo declara la versión en `packageManager`; se puede activar con Corepack, ver abajo).

## Cómo levantar el proyecto en local

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd Reg_Dominial

corepack enable
corepack prepare pnpm@10.32.1 --activate

pnpm install
```

(Si ya tienes `pnpm` instalado globalmente y compatible, puedes usar directamente `pnpm install`.)

### 2. Variables de entorno (Supabase)

Para que listados, formularios y APIs funcionen contra tu base de datos:

1. Copia el archivo de ejemplo:

   ```bash
   cp .env.example .env.local
   ```

2. En [Supabase → Project Settings → API](https://supabase.com/dashboard/project/_/settings/api) copia la **Project URL** y la **anon public** key.

3. Edita `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://TU-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

Sin `.env.local`, la interfaz puede abrirse igual (hay valores de reserva para el cliente), pero **no habrá datos reales** hasta configurar un proyecto Supabase válido.

### 3. Base de datos

Crea las tablas en el SQL Editor de Supabase ejecutando el script del repo:

- `scripts/001_create_tables.sql`

La ruta `GET /api/init` del proyecto asume una función RPC `execute_sql` en Supabase; si no la tienes, usa solo el script SQL anterior.

### 4. Servidor de desarrollo

```bash
pnpm dev
```

Abre en el navegador **http://localhost:3000** (si el puerto está ocupado, Next.js usará otro, por ejemplo 3001; la URL aparece en la consola).

Los cambios en el código se recargan solos (hot reload).

### 5. Build y producción local (opcional)

```bash
pnpm build
pnpm start
```

`pnpm start` sirve la build de producción, por defecto en el puerto 3000.

## Scripts útiles

| Comando      | Descripción                    |
| ------------ | ------------------------------ |
| `pnpm dev`   | Servidor de desarrollo         |
| `pnpm build` | Compilación para producción    |
| `pnpm start` | Ejecutar la build compilada   |
| `pnpm lint`  | Linter (requiere ESLint configurado) |

## Estructura relevante

- `app/` — Rutas y páginas (App Router).
- `components/` — Componentes de UI y módulos de negocio.
- `lib/supabase/` — Cliente Supabase (navegador y servidor).
- `middleware.ts` — Sesión Supabase (si hay URL y clave configuradas).

## Continuar con v0

Este repositorio puede seguir enlazado al proyecto en v0; los detalles y el flujo de despliegue dependen de tu configuración en [v0](https://v0.app).

[Seguir trabajando en v0 →](https://v0.app/chat/projects/prj_dc8mH2Y54vtAW7baycuFSD1uXD5L)

## Más información

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de v0](https://v0.app/docs)
