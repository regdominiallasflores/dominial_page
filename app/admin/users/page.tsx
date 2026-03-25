'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ModuleListToolbar from '@/components/modules/ModuleListToolbar'
import { useAppRole, type AppRole } from '@/components/auth/useAppRole'
import { Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminUsersPage() {
  const router = useRouter()
  const { role, email, displayName, loading, error: roleError } = useAppRole()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [targetEmail, setTargetEmail] = useState('')
  const [targetName, setTargetName] = useState('')
  const [targetPassword, setTargetPassword] = useState('')
  const [targetRole, setTargetRole] = useState<AppRole>('user')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [usersLoading, setUsersLoading] = useState(true)
  const [users, setUsers] = useState<
    Array<{ id: string; email: string | null; role: AppRole | null; displayName: string | null }>
  >([])
  const [usersError, setUsersError] = useState<string | null>(null)
  const [usersErrorHint, setUsersErrorHint] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<{
    id: string
    email: string | null
    role: AppRole | null
    displayName: string | null
  } | null>(null)
  const [editName, setEditName] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editRole, setEditRole] = useState<AppRole>('user')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const canManageUsers = role === 'admin' || role === 'superAdmin'

  const rolesAllowed =
    role === 'superAdmin' ? (['superAdmin', 'admin', 'user'] as const) : (['user'] as const)

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const name = (u.displayName ?? '').toLowerCase()
      const em = (u.email ?? '').toLowerCase()
      const rl = (u.role ?? '').toLowerCase()
      return name.includes(q) || em.includes(q) || rl.includes(q)
    })
  }, [users, searchTerm])

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError(null)
    setUsersErrorHint(null)
    try {
      const res = await fetch('/api/admin/users', { method: 'GET' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUsersError(typeof data?.error === 'string' ? data.error : 'Error al listar usuarios')
        setUsersErrorHint(typeof data?.hint === 'string' ? data.hint : null)
        return
      }
      setUsers(data?.users ?? [])
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    if (!canManageUsers) {
      setUsers([])
      setUsersLoading(false)
      setUsersError(null)
      setUsersErrorHint(null)
      return
    }
    void fetchUsers()
  }, [loading, canManageUsers, fetchUsers])

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.trim(),
          name: targetName.trim(),
          password: targetPassword,
          role: targetRole,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error ?? 'Error al crear usuario')
      }

      setTargetEmail('')
      setTargetName('')
      setTargetPassword('')
      setTargetRole('user')
      setShowCreateForm(false)
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  function onOpenEdit(u: {
    id: string
    email: string | null
    role: AppRole | null
    displayName: string | null
  }) {
    setEditingUser(u)
    setEditName(u.displayName ?? '')
    setEditPassword('')
    setEditRole((u.role ?? 'user') as AppRole)
    setEditError(null)
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return
    setEditSubmitting(true)
    setEditError(null)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          displayName: editName,
          password: editPassword.trim() ? editPassword : undefined,
          role: role === 'superAdmin' ? editRole : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? 'Error al guardar')
      setEditingUser(null)
      await fetchUsers()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function onDeleteUser(u: { id: string; email: string | null; role: AppRole | null }) {
    if (!confirm(`¿Eliminar usuario ${u.email ?? u.id}?`)) return
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? 'Error al eliminar usuario')
      await fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error inesperado')
    }
  }

  if (loading) {
    return (
      <div className="page-container py-6">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!canManageUsers) {
    return (
      <div className="page-container py-6">
        <h1 className="mb-2 text-xl font-bold">No autorizado</h1>
        <p className="text-muted-foreground">Solo admin/superAdmin pueden gestionar usuarios.</p>
        {email ? <p className="mt-3 text-sm">Email: {email}</p> : null}
        {roleError ? <p className="mt-1 text-sm text-red-600">{roleError}</p> : null}
        <Button className="mt-4" onClick={() => router.push('/')}>
          Volver
        </Button>
      </div>
    )
  }

  const sessionSubtitle = [email, role].filter(Boolean).join(' · ')
  const toolbarSubtitle = sessionSubtitle ? `Tu sesión: ${sessionSubtitle}` : 'Cuentas y permisos del sistema'

  return (
    <>
      <div className="page-container py-6">
        <ModuleListToolbar
          title="Gestión de usuarios"
          subtitle={toolbarSubtitle}
          searchPlaceholder="Buscar por nombre, email o rol..."
          onSearchSubmit={setSearchTerm}
          onToggleForm={() => setShowCreateForm((v) => !v)}
          newEntryLabel="Crear usuario"
        />

        {displayName ? (
          <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
            Nombre en perfil: <span className="font-medium text-foreground">{displayName}</span>
          </p>
        ) : null}

        {showCreateForm ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold">Nuevo usuario</h3>
              <form onSubmit={onCreateUser} className="mx-auto max-w-xl space-y-4" autoComplete="off">
                <div>
                  <label className="mb-1 block text-sm font-medium">Nombre</label>
                  <Input
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    type="text"
                    placeholder="Ej: Ana Pérez"
                    required
                    autoComplete="off"
                    className="h-9 border-border bg-background shadow-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <Input
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    type="email"
                    placeholder="usuario@dominio.com"
                    required
                    autoComplete="off"
                    className="h-9 border-border bg-background shadow-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Contraseña</label>
                  <Input
                    value={targetPassword}
                    onChange={(e) => setTargetPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="h-9 border-border bg-background shadow-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Rol</label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as AppRole)}
                    required
                    disabled={role === 'admin'}
                  >
                    {rolesAllowed.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                    {submitting ? 'Creando...' : 'Crear usuario'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setError(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {usersLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Cargando usuarios…</CardContent>
          </Card>
        ) : usersError ? (
          <Card className="border-destructive/40">
            <CardContent className="space-y-2 py-10 text-sm">
              <p className="font-medium text-destructive">{usersError}</p>
              {usersErrorHint ? <p className="text-muted-foreground leading-relaxed">{usersErrorHint}</p> : null}
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {users.length === 0 ? 'No hay usuarios registrados.' : 'No hay resultados para la búsqueda.'}
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Rol</th>
                  <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const initial = (
                    u.displayName?.trim()?.[0] ??
                    u.email?.trim()?.[0] ??
                    '?'
                  ).toUpperCase()
                  const isSelf = (u.email ?? '').toLowerCase() === (email ?? '').toLowerCase()
                  const canDelete =
                    role === 'superAdmin' ? !isSelf : (u.role ?? 'user') === 'user'
                  return (
                    <tr key={u.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                            {initial}
                          </div>
                          <span className="truncate font-medium">{u.displayName ?? '—'}</span>
                        </div>
                      </td>
                      <td className="max-w-[14rem] truncate px-4 py-3 text-muted-foreground">{u.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-black/5',
                            u.role === 'superAdmin' && 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200',
                            u.role === 'admin' && 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200',
                            (u.role === 'user' || !u.role) && 'bg-muted text-muted-foreground',
                          )}
                        >
                          {u.role ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            title="Editar"
                            onClick={() => onOpenEdit(u)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            title="Eliminar"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => void onDeleteUser(u)}
                            disabled={!canDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          {editingUser ? (
            <form onSubmit={onSaveEdit} className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {editingUser.email ?? editingUser.id}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 border-border shadow-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Nueva contraseña</label>
                <Input
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  type="password"
                  placeholder="(dejar vacío para no cambiar)"
                  autoComplete="new-password"
                  className="h-9 border-border shadow-sm"
                />
              </div>
              {role === 'superAdmin' ? (
                <div>
                  <label className="mb-1 block text-sm font-medium">Rol</label>
                  <select
                    className="h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as AppRole)}
                  >
                    <option value="superAdmin">superAdmin</option>
                    <option value="admin">admin</option>
                    <option value="user">user</option>
                  </select>
                </div>
              ) : null}
              {editError ? <p className="text-sm text-red-600">{editError}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={editSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {editSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          ) : null}
        </DialogContent>
    </Dialog>
    </>
  )
}
