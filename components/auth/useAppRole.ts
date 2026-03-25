'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client'

export type AppRole = 'superAdmin' | 'admin' | 'user'

const BOOTSTRAP_SUPERADMIN_EMAIL = 'regdominial@lasflores.gob.ar'
const DEFAULT_BOOTSTRAP_ROLE: AppRole = 'superAdmin'

export function useAppRole() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [role, setRole] = useState<AppRole | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          if (!mounted) return
          setRole(null)
          setEmail(null)
          return
        }

        if (!mounted) return
        setEmail(user.email ?? null)

        const readRole = async () => {
          return supabase
            .from('app_user_roles')
            .select('role, display_name')
            .eq('user_id', user.id)
            .maybeSingle()
        }

        let { data: roleRow, error: roleErr } = await readRole()

        if (roleErr) setError(roleErr.message)

        if (!mounted) return

        const applyRow = (row: { role: string | null; display_name: string | null } | null) => {
          const r = row?.role?.trim()
          if (!r) return
          const low = r.toLowerCase()
          let normalized: AppRole | null = null
          if (low === 'superadmin' || r === 'superAdmin') normalized = 'superAdmin'
          else if (low === 'admin') normalized = 'admin'
          else if (low === 'user') normalized = 'user'
          if (!normalized) return
          setRole(normalized)
          setDisplayName(row?.display_name ?? null)
          setError(null)
        }

        applyRow(roleRow)

        if (roleRow?.role) {
          return
        }

        if (
          (user.email ?? '').toLowerCase() === BOOTSTRAP_SUPERADMIN_EMAIL.toLowerCase()
        ) {
          const { error: insertErr } = await supabase.from('app_user_roles').insert({
            user_id: user.id,
            role: DEFAULT_BOOTSTRAP_ROLE,
            display_name: null,
          })
          if (!insertErr) {
            setRole(DEFAULT_BOOTSTRAP_ROLE)
          } else if (
            (insertErr as { code?: string }).code === '23505' ||
            insertErr.message.toLowerCase().includes('duplicate')
          ) {
            const retry = await readRole()
            if (!mounted) return
            if (retry.error) setError(retry.error.message)
            applyRow(retry.data ?? null)
            if (!retry.data?.role?.trim()) setError(insertErr.message)
          } else if (mounted) {
            setError(insertErr.message)
            setRole(null)
          }
        }
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [supabase])

  return { role, email, displayName, loading, error }
}

