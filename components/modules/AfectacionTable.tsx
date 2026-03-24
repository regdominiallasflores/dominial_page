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
import { ArrowDown, ArrowUp, ArrowUpDown, Bell, Download, Edit2, Trash2 } from 'lucide-react'
import {
  RecordDetailDrawer,
  detailLink,
  formatDetailValue,
  type DetailRow,
} from '@/components/RecordDetailDrawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AfectacionForm from '@/components/modules/AfectacionForm'
import ReminderDialog from '@/components/modules/ReminderDialog'
import {
  AFECTACION_ESTADOS,
  isAfectacionEstado,
  isAfectacionResueltoEstado,
  type AfectacionEstado,
} from '@/lib/afectacion-estados'

type SortColumn = 'fecha_ingreso' | 'afectante' | 'estado' | 'notificado'

function estadoSortRankAfectacion(r: Afectacion) {
  const t = r.estado?.trim() ?? ''
  if (!t) return -1
  if (isAfectacionResueltoEstado(t)) return AFECTACION_ESTADOS.indexOf('Resuelto')
  const i = AFECTACION_ESTADOS.indexOf(t as AfectacionEstado)
  return i >= 0 ? i : 999
}

function compareAfectacionRows(
  a: Afectacion,
  b: Afectacion,
  sortCol: SortColumn | null,
  sortDir: 'asc' | 'desc',
) {
  const ar = isAfectacionResueltoEstado(a.estado)
  const br = isAfectacionResueltoEstado(b.estado)
  if (ar !== br) return ar ? 1 : -1

  let cmp = 0
  if (sortCol === 'fecha_ingreso') {
    cmp = (a.fecha_ingreso || '').localeCompare(b.fecha_ingreso || '')
  } else if (sortCol === 'afectante') {
    cmp = (a.afectante || '').localeCompare(b.afectante || '', 'es', {
      sensitivity: 'base',
      numeric: true,
    })
  } else if (sortCol === 'estado') {
    cmp =
      estadoSortRankAfectacion(a) - estadoSortRankAfectacion(b) ||
      (a.estado || '').localeCompare(b.estado || '', 'es', { sensitivity: 'base' })
  } else if (sortCol === 'notificado') {
    cmp = Number(a.notificado) - Number(b.notificado)
  } else {
    cmp = (b.fecha_ingreso || '').localeCompare(a.fecha_ingreso || '')
  }
  return sortDir === 'asc' ? cmp : -cmp
}

interface Afectacion {
  id: string
  fecha_ingreso: string
  expediente: string
  afectante: string
  link_documentacion: string
  estado: string
  fecha_resolucion: string
  link_descarga: string
  observaciones: string
  notificado: boolean
  representante: string
  telefono: string
}

interface Props {
  searchTerm: string
}

function afectacionDetailRows(r: Afectacion): DetailRow[] {
  return [
    { label: 'Fecha de ingreso', value: formatDetailValue(r.fecha_ingreso) },
    { label: 'Expediente', value: formatDetailValue(r.expediente) },
    { label: 'Afectante', value: formatDetailValue(r.afectante) },
    { label: 'Documentación', value: detailLink(r.link_documentacion) },
    { label: 'Estado', value: formatDetailValue(r.estado) },
    { label: 'Fecha de resolución', value: formatDetailValue(r.fecha_resolucion) },
    { label: 'Enlace de descarga', value: detailLink(r.link_descarga) },
    { label: 'Observaciones', value: formatDetailValue(r.observaciones) },
    { label: 'Notificado', value: formatDetailValue(r.notificado) },
    { label: 'Representante', value: formatDetailValue(r.representante) },
    { label: 'Teléfono', value: formatDetailValue(r.telefono) },
    { label: 'Identificador', value: formatDetailValue(r.id) },
  ]
}

export default function AfectacionTable({ searchTerm }: Props) {
  const [data, setData] = useState<Afectacion[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Afectacion | null>(null)
  const [editing, setEditing] = useState<Afectacion | null>(null)
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
    () => [...data].sort((a, b) => compareAfectacionRows(a, b, sort.col, sort.dir)),
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
      let query = supabase.from('afectacion').select('*')

      if (searchTerm) {
        query = query.or(
          `expediente.ilike.%${searchTerm}%,afectante.ilike.%${searchTerm}%,estado.ilike.%${searchTerm}%`
        )
      }

      const { data: result, error } = await query.order('fecha_ingreso', { ascending: false })

      if (error) throw error
      const rows = result || []
      setData(rows)
      try {
        const ids = rows.map((r) => r.id)
        const pending = await getPendingRemindersByRegistro('afectacion', ids)
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
      const { error } = await supabase.from('afectacion').delete().eq('id', id)
      if (error) throw error
      setData((prev) => prev.filter((item) => item.id !== id))
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

  const handleAddReminder = (id: string, expediente: string) => {
    const existing = pendingReminders.get(id) ?? null
    setReminderTarget({
      id,
      label: `Exp. ${expediente}`,
      titulo: existing?.titulo ?? `Seguimiento: Exp ${expediente}`,
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
      const desc = payload.descripcion || 'Recordatorio de seguimiento de afectación'
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
          tabla_origen: 'afectacion',
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

  const patchRow = (id: string, patch: Partial<Afectacion>) => {
    setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
    setSelected((s) => (s?.id === id ? { ...s, ...patch } : s))
    setEditing((e) => (e?.id === id ? { ...e, ...patch } : e))
  }

  const handleEstadoChange = async (id: string, value: string) => {
    const estado = value.trim() === '' ? null : value.trim()
    try {
      const supabase = createClient()
      const { error } = await supabase.from('afectacion').update({ estado }).eq('id', id)
      if (error) throw error
      patchRow(id, { estado: estado ?? '' })
    } catch (err) {
      console.error('Error:', err)
      alert('No se pudo actualizar el estado')
    }
  }

  const handleNotificadoChange = async (id: string, notificado: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('afectacion').update({ notificado }).eq('id', id)
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

  const estadoSelectDisplayClasses = (raw: string) => {
    const t = raw?.trim() ?? ''
    if (!t) return 'bg-muted text-muted-foreground'
    if (isAfectacionResueltoEstado(t)) {
      return 'bg-emerald-600 font-semibold text-white shadow-sm ring-1 ring-emerald-700/40 hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700'
    }
    const k = t.toLowerCase()
    if (k === 'oficina') return 'bg-slate-100 text-slate-800'
    if (k === 'trabajando') return 'bg-blue-100 text-blue-800'
    if (k === 'observado') return 'bg-amber-100 text-amber-800'
    if (k === 'rechazado') return 'bg-rose-100 text-rose-800'
    if (!isAfectacionEstado(t)) return 'bg-amber-100 text-amber-800'
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
          No hay trámites de afectación registrados
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
              <SortHeading column="fecha_ingreso">Fecha</SortHeading>
              <th className="px-4 py-3 text-left font-semibold">Expediente</th>
              <SortHeading column="afectante">Afectante</SortHeading>
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
                  isAfectacionResueltoEstado(item.estado)
                    ? 'bg-emerald-100 [&>td]:bg-emerald-100 hover:bg-emerald-200 hover:[&>td]:bg-emerald-200 dark:bg-emerald-950/55 dark:[&>td]:bg-emerald-950/55 dark:hover:bg-emerald-900/65 dark:hover:[&>td]:bg-emerald-900/65'
                    : 'hover:bg-muted/50',
                )}
                onClick={() => setSelected(item)}
              >
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{item.fecha_ingreso}</td>
                <td className="px-4 py-3 font-medium">{item.expediente}</td>
                <td className="px-4 py-3">{item.afectante}</td>
                <td
                  className="px-4 py-3"
                  onClick={cellStopDrawer}
                  onPointerDown={cellStopDrawer}
                >
                  <select
                    aria-label="Cambiar estado"
                    value={item.estado ?? ''}
                    title="Cambiar estado"
                    onChange={(e) => void handleEstadoChange(item.id, e.target.value)}
                    className={cn(
                      'max-w-[11rem] cursor-pointer rounded-full border-0 py-1 pl-2 pr-7 text-xs font-medium shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/60',
                      estadoSelectDisplayClasses(item.estado ?? ''),
                    )}
                  >
                    {!isAfectacionEstado(item.estado ?? '') && (item.estado ?? '').trim() !== '' ? (
                      <option value={item.estado}>{item.estado} (valor anterior)</option>
                    ) : null}
                    <option value="">Sin estado</option>
                    {AFECTACION_ESTADOS.map((estado) => (
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
                    {item.link_descarga && (
                      <a href={item.link_descarga} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" title="Descargar">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddReminder(item.id, item.expediente)}
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
        title="Detalle — Afectación"
        description={selected ? `Exp. ${selected.expediente}` : undefined}
        rows={selected ? afectacionDetailRows(selected) : []}
      />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar afectación</DialogTitle>
          </DialogHeader>
          {editing && (
            <AfectacionForm
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
            ? `af-${reminderTarget.id}-${reminderTarget.existing?.reminderId ?? 'new'}`
            : 'af-idle'
        }
        open={reminderTarget !== null}
        onOpenChange={(open) => !open && setReminderTarget(null)}
        target={
          reminderTarget
            ? {
                id: reminderTarget.id,
                label: reminderTarget.label,
                titulo: reminderTarget.titulo,
                tablaOrigen: 'afectacion',
                existing: reminderTarget.existing,
              }
            : null
        }
        onSubmit={handleSaveReminder}
      />
    </>
  )
}
