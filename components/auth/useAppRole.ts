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

        const { data: roleRow, error: roleErr } = await supabase
          .from('app_user_roles')
          .select('role, display_name')
          .eq('user_id', user.id)
          .maybeSingle()

        if (roleErr) setError(roleErr.message)

        if (!mounted) return

        if (roleRow?.role) {
          setRole(roleRow.role as AppRole)
          setDisplayName(roleRow.display_name ?? null)
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

