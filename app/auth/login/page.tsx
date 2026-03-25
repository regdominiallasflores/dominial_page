'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('regdominial@lasflores.gob.ar')
  const [password, setPassword] = useState('Regdommun1256')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (signInErr) {
        const extra = [
          (signInErr as any).code ? `code: ${(signInErr as any).code}` : null,
          (signInErr as any).status ? `status: ${(signInErr as any).status}` : null,
        ].filter(Boolean)
        setError(extra.length ? `${signInErr.message} (${extra.join(', ')})` : signInErr.message)
        return
      }

      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-4">Iniciar sesión</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm font-medium">
            Email
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="block text-sm font-medium">
            Contraseña
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

