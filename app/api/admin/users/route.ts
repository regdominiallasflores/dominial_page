import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSupabaseAdminClient,
  isSupabaseServiceRoleConfigured,
  serviceRoleMissingResponseBody,
} from '@/lib/supabase/admin'
import { getCallerRoleOrBootstrap } from '@/lib/supabase/caller-role'
import { hintForSupabaseError } from '@/lib/supabase/api-hints'

type CreateUserPayload = {
  email: string
  name: string
  password: string
  role: 'superAdmin' | 'admin' | 'user'
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isSupabaseServiceRoleConfigured()) {
      return NextResponse.json(serviceRoleMissingResponseBody(), { status: 503 })
    }

    const callerRole = await getCallerRoleOrBootstrap(supabase, {
      userId: user.id,
      email: user.email,
    })
    if (!callerRole) {
      return NextResponse.json({ error: 'Rol no asignado' }, { status: 403 })
    }

    const payload = (await req.json()) as CreateUserPayload
    const { email, name, password, role } = payload

    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const allowedRoles: Array<CreateUserPayload['role']> =
      callerRole === 'superAdmin'
        ? ['superAdmin', 'admin', 'user']
        : callerRole === 'admin'
          ? ['user']
          : []

    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'No autorizado para crear ese rol' }, { status: 403 })
    }

    const supabaseAdmin = getSupabaseAdminClient()

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 400 })
    }

    const createdUserId = created.user.id as string
    const { error: roleInsertErr } = await supabaseAdmin.from('app_user_roles').insert({
      user_id: createdUserId,
      role,
      display_name: name.trim(),
    })

    if (roleInsertErr) {
      const msg = roleInsertErr.message
      const hint = hintForSupabaseError(msg)
      return NextResponse.json({ error: msg, ...(hint && { hint }) }, { status: 500 })
    }

    return NextResponse.json({ ok: true, userId: createdUserId, role })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    const hint = hintForSupabaseError(message)
    return NextResponse.json({ error: message, ...(hint && { hint }) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isSupabaseServiceRoleConfigured()) {
      return NextResponse.json(serviceRoleMissingResponseBody(), { status: 503 })
    }

    const callerRole = await getCallerRoleOrBootstrap(supabase, {
      userId: user.id,
      email: user.email,
    })
    if (callerRole !== 'superAdmin' && callerRole !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const supabaseAdmin = getSupabaseAdminClient()

    const { data: rolesRows, error: rolesErr } = await supabaseAdmin
      .from('app_user_roles')
      .select('user_id, role, display_name')

    if (rolesErr) {
      const msg = rolesErr.message
      const hint = hintForSupabaseError(msg)
      return NextResponse.json({ error: msg, ...(hint && { hint }) }, { status: 500 })
    }

    const roleByUserId = new Map(
      (rolesRows ?? []).map((r) => [r.user_id as string, r] as const),
    )

    const authAny = supabaseAdmin.auth as any
    if (!authAny?.admin?.listUsers) {
      return NextResponse.json(
        { error: 'Supabase auth.admin.listUsers no disponible' },
        { status: 500 },
      )
    }

    const { data: usersData, error: usersErr } = await authAny.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (usersErr) {
      return NextResponse.json({ error: usersErr.message }, { status: 500 })
    }

    const users = usersData?.users ?? []

    const result = users.map((u: any) => {
      const row = roleByUserId.get(u.id)
      return {
        id: u.id as string,
        email: u.email as string | null,
        role: row?.role ?? null,
        displayName: row?.display_name ?? null,
      }
    })

    return NextResponse.json({ ok: true, users: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    const hint = hintForSupabaseError(message)
    return NextResponse.json({ error: message, ...(hint && { hint }) }, { status: 500 })
  }
}

