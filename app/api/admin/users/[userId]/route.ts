import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSupabaseAdminClient,
  isSupabaseServiceRoleConfigured,
  serviceRoleMissingResponseBody,
} from '@/lib/supabase/admin'
import { getCallerRoleOrBootstrap, type AppRole } from '@/lib/supabase/caller-role'
import { hintForSupabaseError } from '@/lib/supabase/api-hints'

type PatchPayload = {
  displayName?: string
  password?: string
  role?: AppRole
}

function isRole(v: unknown): v is AppRole {
  return v === 'superAdmin' || v === 'admin' || v === 'user'
}

export async function PATCH(req: Request, ctx: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await ctx.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    if (!isSupabaseServiceRoleConfigured()) {
      return NextResponse.json(serviceRoleMissingResponseBody(), { status: 503 })
    }

    const callerRole = await getCallerRoleOrBootstrap(supabase, {
      userId: user.id,
      email: user.email,
    })
    if (!callerRole) return NextResponse.json({ error: 'Rol no asignado' }, { status: 403 })

    const payload = (await req.json()) as PatchPayload
    const supabaseAdmin = getSupabaseAdminClient()

    const isSelf = userId === user.id

    if (callerRole === 'admin') {
      const { data: targetRoleRow } = await supabaseAdmin
        .from('app_user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      if ((targetRoleRow?.role as AppRole | undefined) !== 'user') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
      if (payload.role) {
        return NextResponse.json({ error: 'No autorizado para cambiar rol' }, { status: 403 })
      }
    }

    if (payload.role) {
      if (!isRole(payload.role)) {
        return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
      }
      if (isSelf && payload.role !== 'superAdmin') {
        return NextResponse.json(
          { error: 'No podés cambiar tu propio rol de superAdmin' },
          { status: 400 },
        )
      }
      const { error: upRoleErr } = await supabaseAdmin
        .from('app_user_roles')
        .update({ role: payload.role })
        .eq('user_id', userId)
      if (upRoleErr) return NextResponse.json({ error: upRoleErr.message }, { status: 500 })
    }

    if (typeof payload.displayName === 'string') {
      const name = payload.displayName.trim()
      const { error: upNameErr } = await supabaseAdmin
        .from('app_user_roles')
        .update({ display_name: name.length ? name : null })
        .eq('user_id', userId)
      if (upNameErr) return NextResponse.json({ error: upNameErr.message }, { status: 500 })
    }

    if (typeof payload.password === 'string' && payload.password.trim().length > 0) {
      const authAny = supabaseAdmin.auth as any
      if (!authAny?.admin?.updateUserById) {
        return NextResponse.json(
          { error: 'Supabase auth.admin.updateUserById no disponible' },
          { status: 500 },
        )
      }
      const { error: passErr } = await authAny.admin.updateUserById(userId, {
        password: payload.password,
      })
      if (passErr) return NextResponse.json({ error: passErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    const hint = hintForSupabaseError(message)
    return NextResponse.json({ error: message, ...(hint && { hint }) }, { status: 500 })
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await ctx.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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

    if (userId === user.id) {
      return NextResponse.json({ error: 'No podés eliminar tu propio usuario' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()

    if (callerRole === 'admin') {
      const { data: targetRoleRow } = await supabaseAdmin
        .from('app_user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()
      if ((targetRoleRow?.role as AppRole | undefined) !== 'user') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

    const authAny = supabaseAdmin.auth as any
    if (!authAny?.admin?.deleteUser) {
      return NextResponse.json(
        { error: 'Supabase auth.admin.deleteUser no disponible' },
        { status: 500 },
      )
    }

    const { error: delErr } = await authAny.admin.deleteUser(userId)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    const hint = hintForSupabaseError(message)
    return NextResponse.json({ error: message, ...(hint && { hint }) }, { status: 500 })
  }
}

