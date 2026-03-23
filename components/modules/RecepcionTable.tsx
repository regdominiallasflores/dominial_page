'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseEnvStatus, isSupabaseConfigured } from '@/lib/supabase/credentials'
import { formatSupabaseError } from '@/lib/supabase/format-error'
import { getPendingRemindersByRegistro, type PendingReminderInfo } from '@/lib/reminders'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Bell, Edit2 } from 'lucide-react'
import {
  RecordDetailDrawer,
  formatDetailValue,
  type DetailRow,
} from '@/components/RecordDetailDrawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import RecepcionForm from '@/components/modules/RecepcionForm'
import ReminderDialog from '@/components/modules/ReminderDialog'

interface Recepcion {
  id: string
  fecha_ingreso: string
  apellido_nombre: string
  direccion: string
  telefono: string
  tema: string
  descripcion: string
  estado: string
  observaciones: string
  fecha_resolucion: string
}

interface Props {
  searchTerm: string
}

type LoadError =
  | { kind: 'missing_env' }
  | { kind: 'api'; message: string }

function recepcionDetailRows(r: Recepcion): DetailRow[] {
  return [
    { label: 'Fecha de ingreso', value: formatDetailValue(r.fecha_ingreso) },
    { label: 'Apellido y nombre', value: formatDetailValue(r.apellido_nombre) },
    { label: 'Dirección', value: formatDetailValue(r.direccion) },
    { label: 'Teléfono', value: formatDetailValue(r.telefono) },
    { label: 'Tema', value: formatDetailValue(r.tema) },
    { label: 'Descripción', value: formatDetailValue(r.descripcion) },
    { label: 'Estado', value: formatDetailValue(r.estado) },
    { label: 'Observaciones', value: formatDetailValue(r.observaciones) },
    { label: 'Fecha de resolución', value: formatDetailValue(r.fecha_resolucion) },
    { label: 'Identificador', value: formatDetailValue(r.id) },
  ]
}

export default function RecepcionTable({ searchTerm }: Props) {
  const [data, setData] = useState<Recepcion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<LoadError | null>(null)
  const [selected, setSelected] = useState<Recepcion | null>(null)
  const [editing, setEditing] = useState<Recepcion | null>(null)
  const [pendingReminders, setPendingReminders] = useState<Map<string, PendingReminderInfo>>(new Map())
  const [reminderTarget, setReminderTarget] = useState<{
    id: string
    label: string
    titulo: string
    existing: PendingReminderInfo | null
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      setLoadError(null)
      if (!isSupabaseConfigured()) {
        setLoadError({ kind: 'missing_env' })
        setData([])
        return
      }
      const supabase = createClient()
      let query = supabase.from('recepcion').select('*')

      if (searchTerm) {
        query = query.or(
          `apellido_nombre.ilike.%${searchTerm}%,tema.ilike.%${searchTerm}%,estado.ilike.%${searchTerm}%`
        )
      }

      const { data: result, error } = await query.order('fecha_ingreso', { ascending: false })

      if (error) {
        const msg = formatSupabaseError(error)
        setLoadError({ kind: 'api', message: msg })
        setData([])
        console.error('Error fetching recepción:', msg)
        return
      }
      const rows = result || []
      setData(rows)
      try {
        const ids = rows.map((r) => r.id)
        const pending = await getPendingRemindersByRegistro('recepcion', ids)
        setPendingReminders(pending)
      } catch (err) {
        console.error('Error loading reminders:', formatSupabaseError(err))
      }
    } catch (err) {
      const msg = formatSupabaseError(err)
      setLoadError({ kind: 'api', message: msg })
      setData([])
      console.error('Error fetching recepción:', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este trámite?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('recepcion').delete().eq('id', id)
      if (error) throw error
      setData(data.filter(item => item.id !== id))
      setSelected((s) => (s?.id === id ? null : s))
      setEditing((s) => (s?.id === id ? null : s))
      setPendingReminders((prev) => {
        const next = new Map(prev)
        next.delete(id)
        return next
      })
    } catch (err) {
      console.error('Error deleting:', formatSupabaseError(err), err)
    }
  }

  const handleAddReminder = (id: string, nombre: string) => {
    const existing = pendingReminders.get(id) ?? null
    setReminderTarget({
      id,
      label: nombre,
      titulo: existing?.titulo ?? `Seguimiento: ${nombre}`,
      existing,
    })
  }

  const handleSaveReminder = async (
    payload: { titulo: string; descripcion: string; fechaRecordatorio: string },
    target: {
      id: string
      label: string
      titulo: string
      tablaOrigen: string
      existing?: PendingReminderInfo | null
    },
  ) => {
    try {
      const supabase = createClient()
      const desc =
        payload.descripcion || 'Recordatorio de seguimiento de trámite de recepción'
      if (target.existing?.reminderId) {
        const { error } = await supabase
          .from('recordatorios')
          .update({
            titulo: payload.titulo,
            descripcion: desc,
            fecha_recordatorio: payload.fechaRecordatorio,
          })
          .eq('id', target.existing.reminderId)
        if (error) throw error
        alert('Recordatorio actualizado')
      } else {
        const { error } = await supabase.from('recordatorios').insert({
          titulo: payload.titulo,
          descripcion: desc,
          fecha_recordatorio: payload.fechaRecordatorio,
          tabla_origen: 'recepcion',
          registro_id: target.id,
        })
        if (error) throw error
        alert('Recordatorio creado exitosamente')
      }
      setReminderTarget(null)
      void fetchData()
    } catch (err) {
      console.error('Error saving reminder:', formatSupabaseError(err), err)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Cargando datos...
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    if (loadError.kind === 'missing_env') {
      const dev = process.env.NODE_ENV === 'development'
      const status = getSupabaseEnvStatus()
      return (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="pt-6 space-y-3">
            <p className="font-medium text-foreground">Falta configurar Supabase</p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1.5">
              <li>
                En la raíz del proyecto, crea el archivo{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code> (puedes copiar{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.example</code>).
              </li>
              <li>
                En{' '}
                <a
                  className="text-primary underline underline-offset-2"
                  href="https://supabase.com/dashboard/project/_/settings/api"
                  target="_blank"
                  rel="noreferrer"
                >
                  Supabase → Settings → API
                </a>
                , copia <strong>Project URL</strong> y la clave <strong>anon public</strong>.
              </li>
              <li>
                Pégalas así (sin comillas extra ni espacios alrededor del <code className="text-xs">=</code>):
                <pre className="mt-2 p-3 rounded-md bg-muted text-xs overflow-x-auto text-left">
                  {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
                </pre>
              </li>
              <li>
                Guarda el archivo y <strong>reinicia</strong> el servidor (<kbd className="text-xs font-mono">Ctrl+C</kbd>{' '}
                y vuelve a ejecutar <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm dev</code>). Next.js solo
                lee estas variables al arrancar.
              </li>
            </ol>
            {dev && (
              <p className="text-xs text-muted-foreground border-t border-border pt-3">
                Diagnóstico (desarrollo): la app ve{' '}
                <span className={status.hasUrl ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                  URL {status.hasUrl ? 'sí' : 'no'}
                </span>
                {' · '}
                <span className={status.hasKey ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                  anon key {status.hasKey ? 'sí' : 'no'}
                </span>
                . Si ya editaste `.env.local` y sigue en &quot;no&quot;, reinicia `pnpm dev` o revisa el nombre del archivo.
              </p>
            )}
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6 space-y-2">
          <p className="font-medium text-destructive">No se pudieron cargar los trámites</p>
          <p className="text-sm text-muted-foreground">{loadError.message}</p>
          <p className="text-xs text-muted-foreground">
            Si ya configuraste Supabase, crea las tablas con `scripts/001_create_tables.sql` en el SQL
            Editor y revisa políticas RLS para el rol `anon` si aplica.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No hay trámites de recepción registrados
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 font-semibold">Tema</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
              <th className="text-left px-4 py-3 font-semibold">Teléfono</th>
              <th className="text-center px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelected(item)}
              >
                <td className="px-4 py-3">{item.fecha_ingreso}</td>
                <td className="px-4 py-3 font-medium">{item.apellido_nombre}</td>
                <td className="px-4 py-3">{item.tema}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    item.estado === 'Resuelto' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.estado}
                  </span>
                </td>
                <td className="px-4 py-3">{item.telefono}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(item)}
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddReminder(item.id, item.apellido_nombre)}
                    title={
                      pendingReminders.has(item.id)
                        ? 'Editar recordatorio'
                        : 'Agregar recordatorio'
                    }
                    className={cn(
                      pendingReminders.has(item.id) &&
                        'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800',
                    )}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RecordDetailDrawer
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Detalle — Recepción"
        description={selected?.apellido_nombre}
        rows={selected ? recepcionDetailRows(selected) : []}
      />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar trámite de recepción</DialogTitle>
          </DialogHeader>
          {editing && (
            <RecepcionForm
              editRecord={editing}
              onSuccess={() => {
                setEditing(null)
                void fetchData()
              }}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ReminderDialog
        key={
          reminderTarget
            ? `rec-${reminderTarget.id}-${reminderTarget.existing?.reminderId ?? 'new'}`
            : 'rec-idle'
        }
        open={reminderTarget !== null}
        onOpenChange={(open) => !open && setReminderTarget(null)}
        target={
          reminderTarget
            ? {
                id: reminderTarget.id,
                label: reminderTarget.label,
                titulo: reminderTarget.titulo,
                tablaOrigen: 'recepcion',
                existing: reminderTarget.existing,
              }
            : null
        }
        onSubmit={handleSaveReminder}
      />
    </>
  )
}
