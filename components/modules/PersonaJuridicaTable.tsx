'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getPendingRemindersByRegistro,
  getReminderBellButtonClass,
  type PendingReminderInfo,
} from '@/lib/reminders'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, ArrowUpDown, Bell, Edit2, Trash2 } from 'lucide-react'
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
import PersonaJuridicaForm from '@/components/modules/PersonaJuridicaForm'
import ReminderDialog from '@/components/modules/ReminderDialog'
import {
  PERSONA_JURIDICA_ESTADOS,
  isPersonaJuridicaEstado,
  type PersonaJuridicaEstado,
} from '@/lib/persona-juridica-estados'

type SortColumn = 'denominacion' | 'estado' | 'notificado'

function isRowResuelto(r: PersonaJuridica) {
  return (r.resolucion?.trim() ?? '') === 'Resuelto'
}

function estadoSortRank(r: PersonaJuridica) {
  const t = r.resolucion?.trim() ?? ''
  if (!t) return -1
  const i = PERSONA_JURIDICA_ESTADOS.indexOf(t as PersonaJuridicaEstado)
  return i >= 0 ? i : 999
}

function comparePersonaJuridicaRows(
  a: PersonaJuridica,
  b: PersonaJuridica,
  sortCol: SortColumn | null,
  sortDir: 'asc' | 'desc',
) {
  const ar = isRowResuelto(a)
  const br = isRowResuelto(b)
  if (ar !== br) return ar ? 1 : -1

  let cmp = 0
  if (sortCol === 'denominacion') {
    cmp = (a.denominacion || '').localeCompare(b.denominacion || '', 'es', {
      sensitivity: 'base',
      numeric: true,
    })
  } else if (sortCol === 'estado') {
    cmp =
      estadoSortRank(a) - estadoSortRank(b) ||
      (a.resolucion || '').localeCompare(b.resolucion || '', 'es', { sensitivity: 'base' })
  } else if (sortCol === 'notificado') {
    cmp = Number(a.notificado) - Number(b.notificado)
  } else {
    cmp = (b.ingreso || '').localeCompare(a.ingreso || '')
  }
  return sortDir === 'asc' ? cmp : -cmp
}

interface PersonaJuridica {
  id: string
  ingreso: string
  legajo: string
  expediente: string
  denominacion: string
  tramite: string
  resolucion: string
  fecha_resolucion: string
  observaciones: string
  notificado: boolean
  representante: string
  telefono: string
}

interface Props {
  searchTerm: string
}

function personaJuridicaDetailRows(r: PersonaJuridica): DetailRow[] {
  return [
    { label: 'Ingreso', value: formatDetailValue(r.ingreso) },
    { label: 'Legajo', value: formatDetailValue(r.legajo) },
    { label: 'Expediente', value: formatDetailValue(r.expediente) },
    { label: 'Denominación', value: formatDetailValue(r.denominacion) },
    { label: 'Trámite', value: formatDetailValue(r.tramite) },
    { label: 'Estado', value: formatDetailValue(r.resolucion) },
    { label: 'Fecha de resolución', value: formatDetailValue(r.fecha_resolucion) },
    { label: 'Observaciones', value: formatDetailValue(r.observaciones) },
    { label: 'Notificado', value: formatDetailValue(r.notificado) },
    { label: 'Representante', value: formatDetailValue(r.representante) },
    { label: 'Teléfono', value: formatDetailValue(r.telefono) },
    { label: 'Identificador', value: formatDetailValue(r.id) },
  ]
}

export default function PersonaJuridicaTable({ searchTerm }: Props) {
  const [data, setData] = useState<PersonaJuridica[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PersonaJuridica | null>(null)
  const [editing, setEditing] = useState<PersonaJuridica | null>(null)
  const [pendingReminders, setPendingReminders] = useState<Map<string, PendingReminderInfo>>(new Map())
  const [reminderTarget, setReminderTarget] = useState<{
    id: string
    label: string
    titulo: string
    existing: PendingReminderInfo | null
  } | null>(null)
  const [sort, setSort] = useState<{ col: SortColumn | null; dir: 'asc' | 'desc' }>({
    col: null,
    dir: 'desc',
  })

  const displayData = useMemo(
    () => [...data].sort((a, b) => comparePersonaJuridicaRows(a, b, sort.col, sort.dir)),
    [data, sort.col, sort.dir],
  )

  const handleSortClick = (col: SortColumn) => {
    setSort((s) =>
      s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' },
    )
  }

  const SortHeading = ({
    column,
    children,
  }: {
    column: SortColumn
    children: ReactNode
  }) => {
    const active = sort.col === column
    return (
      <th className="px-4 py-3 text-left">
        <button
          type="button"
          className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
          onClick={() => handleSortClick(column)}
        >
          {children}
          {active ? (
            sort.dir === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />
          )}
        </button>
      </th>
    )
  }

  useEffect(() => {
    fetchData()
  }, [searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      let query = supabase.from('persona_juridica').select('*')

      if (searchTerm) {
        query = query.or(
          `legajo.ilike.%${searchTerm}%,expediente.ilike.%${searchTerm}%,denominacion.ilike.%${searchTerm}%,representante.ilike.%${searchTerm}%,tramite.ilike.%${searchTerm}%,resolucion.ilike.%${searchTerm}%`,
        )
      }

      const { data: result, error } = await query.order('ingreso', { ascending: false })

      if (error) throw error
      const rows = result || []
      setData(rows)
      try {
        const ids = rows.map((r) => r.id)
        const pending = await getPendingRemindersByRegistro('persona_juridica', ids)
        setPendingReminders(pending)
      } catch (err) {
        console.error('Error loading reminders:', err)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este trámite?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('persona_juridica').delete().eq('id', id)
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
      console.error('Error deleting:', err)
    }
  }

  const handleAddReminder = (id: string, denominacion: string) => {
    const existing = pendingReminders.get(id) ?? null
    setReminderTarget({
      id,
      label: denominacion,
      titulo: existing?.titulo ?? `Seguimiento: ${denominacion}`,
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
        payload.descripcion || 'Recordatorio de seguimiento de persona jurídica'
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
          tabla_origen: 'persona_juridica',
          registro_id: target.id,
        })
        if (error) throw error
        alert('Recordatorio creado exitosamente')
      }
      setReminderTarget(null)
      void fetchData()
    } catch (err) {
      console.error('Error saving reminder:', err)
    }
  }

  const patchRow = (id: string, patch: Partial<PersonaJuridica>) => {
    setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
    setSelected((s) => (s?.id === id ? { ...s, ...patch } : s))
    setEditing((e) => (e?.id === id ? { ...e, ...patch } : e))
  }

  const handleResolucionChange = async (id: string, value: string) => {
    const resolucion = value.trim() === '' ? null : value.trim()
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('persona_juridica')
        .update({ resolucion })
        .eq('id', id)
      if (error) throw error
      patchRow(id, { resolucion: resolucion ?? '' })
    } catch (err) {
      console.error('Error:', err)
      alert('No se pudo actualizar el estado')
    }
  }

  const handleNotificadoChange = async (id: string, notificado: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('persona_juridica').update({ notificado }).eq('id', id)
      if (error) throw error
      patchRow(id, { notificado })
    } catch (err) {
      console.error('Error:', err)
      alert('No se pudo actualizar notificado')
    }
  }

  const cellStopDrawer = (e: { stopPropagation(): void }) => {
    e.stopPropagation()
  }

  const estadoDisplayClasses = (raw: string) => {
    const t = raw?.trim() ?? ''
    if (!t) return 'bg-muted text-muted-foreground'
    if (t === 'Resuelto') {
      return 'bg-emerald-600 font-semibold text-white shadow-sm ring-1 ring-emerald-700/40 hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700'
    }
    if (!isPersonaJuridicaEstado(t)) return 'bg-amber-100 text-amber-800'
    return 'bg-blue-100 text-blue-800'
  }

  const notificadoSelectClasses = (notificado: boolean) =>
    notificado
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
      : 'bg-gray-100 text-gray-800 dark:bg-muted dark:text-muted-foreground'

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Cargando datos...
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No hay trámites de persona jurídica registrados
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
              <th className="px-4 py-3 text-left font-semibold">Legajo</th>
              <SortHeading column="denominacion">Denominación</SortHeading>
              <th className="px-4 py-3 text-left font-semibold">Trámite</th>
              <SortHeading column="estado">Estado</SortHeading>
              <SortHeading column="notificado">Notificado</SortHeading>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'cursor-pointer border-b border-border transition-colors',
                  isRowResuelto(item)
                    ? // Fondo fijo en fila y celdas (algunos navegadores no pintan solo el <tr>)
                      'bg-emerald-100 [&>td]:bg-emerald-100 hover:bg-emerald-200 hover:[&>td]:bg-emerald-200 dark:bg-emerald-950/55 dark:[&>td]:bg-emerald-950/55 dark:hover:bg-emerald-900/65 dark:hover:[&>td]:bg-emerald-900/65'
                    : 'hover:bg-muted/50',
                )}
                onClick={() => setSelected(item)}
              >
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {item.legajo?.trim() ? item.legajo : '—'}
                </td>
                <td className="px-4 py-3 font-medium">{item.denominacion}</td>
                <td className="px-4 py-3 text-xs">{item.tramite || '—'}</td>
                <td
                  className="px-4 py-3"
                  onClick={cellStopDrawer}
                  onPointerDown={cellStopDrawer}
                >
                  <select
                    aria-label="Cambiar estado"
                    value={item.resolucion ?? ''}
                    title="Cambiar estado"
                    onChange={(e) => void handleResolucionChange(item.id, e.target.value)}
                    className={cn(
                      'max-w-[12.5rem] cursor-pointer rounded-full border-0 py-1 pl-2 pr-7 text-xs font-medium shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/60',
                      estadoDisplayClasses(item.resolucion ?? ''),
                    )}
                  >
                    {!isPersonaJuridicaEstado(item.resolucion ?? '') &&
                    (item.resolucion ?? '').trim() !== '' ? (
                      <option value={item.resolucion}>{item.resolucion} (valor anterior)</option>
                    ) : null}
                    <option value="">Sin estado</option>
                    {PERSONA_JURIDICA_ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </td>
                <td
                  className="px-4 py-3"
                  onClick={cellStopDrawer}
                  onPointerDown={cellStopDrawer}
                >
                  <select
                    aria-label="Cambiar notificado"
                    value={item.notificado ? 'true' : 'false'}
                    title="Marcar si fue notificado"
                    onChange={(e) =>
                      void handleNotificadoChange(item.id, e.target.value === 'true')
                    }
                    className={cn(
                      'cursor-pointer rounded-full border-0 py-1 pl-2 pr-6 text-xs font-medium shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/60',
                      notificadoSelectClasses(item.notificado),
                    )}
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </td>
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
                    onClick={() => handleAddReminder(item.id, item.denominacion)}
                    title={
                      pendingReminders.has(item.id)
                        ? 'Editar recordatorio'
                        : 'Agregar recordatorio'
                    }
                    className={cn(getReminderBellButtonClass(pendingReminders, item.id))}
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
        title="Detalle — Persona jurídica"
        description={selected?.denominacion}
        rows={selected ? personaJuridicaDetailRows(selected) : []}
      />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar persona jurídica</DialogTitle>
          </DialogHeader>
          {editing && (
            <PersonaJuridicaForm
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
            ? `pj-${reminderTarget.id}-${reminderTarget.existing?.reminderId ?? 'new'}`
            : 'pj-idle'
        }
        open={reminderTarget !== null}
        onOpenChange={(open) => !open && setReminderTarget(null)}
        target={
          reminderTarget
            ? {
                id: reminderTarget.id,
                label: reminderTarget.label,
                titulo: reminderTarget.titulo,
                tablaOrigen: 'persona_juridica',
                existing: reminderTarget.existing,
              }
            : null
        }
        onSubmit={handleSaveReminder}
      />
    </>
  )
}
