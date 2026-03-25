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
import { ArrowDown, ArrowUp, ArrowUpDown, Trash2, Bell, Download, Edit2 } from 'lucide-react'
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
import LeyPierriForm from '@/components/modules/LeyPierriForm'
import ReminderDialog from '@/components/modules/ReminderDialog'
import {
  LEY_PIERRI_ESCRIBANIAS,
  LEY_PIERRI_ESTADOS,
  isLeyPierriEstado,
  isLeyPierriEscribaniaEstadoRow,
  type LeyPierriEstado,
} from '@/lib/ley-pierri-constants'
import { useAppRole } from '@/components/auth/useAppRole'
import { formatDateDdMmYyyy } from '@/lib/format-date'

interface LeyPierri {
  id: string
  fecha_ingreso: string
  beneficiarios: string
  direccion: string
  telefono: string
  observaciones: string
  link_documentacion: string
  estado: string
  escribania: string
}

interface Props {
  searchTerm: string
}

type SortColumn = 'fecha_ingreso' | 'beneficiarios' | 'estado' | 'escribania'

function estadoSortRankPierri(r: LeyPierri) {
  const t = r.estado?.trim() ?? ''
  if (!t) return -1
  const i = LEY_PIERRI_ESTADOS.indexOf(t as LeyPierriEstado)
  return i >= 0 ? i : 999
}

function compareLeyPierriRows(
  a: LeyPierri,
  b: LeyPierri,
  sortCol: SortColumn | null,
  sortDir: 'asc' | 'desc',
) {
  const ar = isLeyPierriEscribaniaEstadoRow(a.estado)
  const br = isLeyPierriEscribaniaEstadoRow(b.estado)
  if (ar !== br) return ar ? 1 : -1

  let cmp = 0
  if (sortCol === 'fecha_ingreso') {
    cmp = (a.fecha_ingreso || '').localeCompare(b.fecha_ingreso || '')
  } else if (sortCol === 'beneficiarios') {
    cmp = (a.beneficiarios || '').localeCompare(b.beneficiarios || '', 'es', {
      sensitivity: 'base',
      numeric: true,
    })
  } else if (sortCol === 'estado') {
    cmp =
      estadoSortRankPierri(a) - estadoSortRankPierri(b) ||
      (a.estado || '').localeCompare(b.estado || '', 'es', { sensitivity: 'base' })
  } else if (sortCol === 'escribania') {
    cmp = (a.escribania || '').localeCompare(b.escribania || '', 'es', {
      sensitivity: 'base',
      numeric: true,
    })
  } else {
    cmp = (b.fecha_ingreso || '').localeCompare(a.fecha_ingreso || '')
  }
  return sortDir === 'asc' ? cmp : -cmp
}

function leyPierriDetailRows(r: LeyPierri): DetailRow[] {
  return [
    { label: 'Fecha de ingreso', value: formatDetailValue(r.fecha_ingreso) },
    { label: 'Beneficiarios', value: formatDetailValue(r.beneficiarios) },
    { label: 'Dirección', value: formatDetailValue(r.direccion) },
    { label: 'Teléfono', value: formatDetailValue(r.telefono) },
    { label: 'Observaciones', value: formatDetailValue(r.observaciones) },
    { label: 'Documentación', value: detailLink(r.link_documentacion) },
    { label: 'Estado', value: formatDetailValue(r.estado) },
    { label: 'Escribanía', value: formatDetailValue(r.escribania) },
    { label: 'Identificador', value: formatDetailValue(r.id) },
  ]
}

export default function LeyPierriTable({ searchTerm }: Props) {
  const [data, setData] = useState<LeyPierri[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<LeyPierri | null>(null)
  const [editing, setEditing] = useState<LeyPierri | null>(null)
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

  const { role, loading: roleLoading } = useAppRole()
  const canWrite = role === 'admin' || role === 'superAdmin' || roleLoading

  const displayData = useMemo(
    () => [...data].sort((a, b) => compareLeyPierriRows(a, b, sort.col, sort.dir)),
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
      let query = supabase.from('ley_pierri').select('*')

      if (searchTerm) {
        query = query.or(
          `beneficiarios.ilike.%${searchTerm}%,estado.ilike.%${searchTerm}%,escribania.ilike.%${searchTerm}%`
        )
      }

      const { data: result, error } = await query.order('fecha_ingreso', { ascending: false })

      if (error) throw error
      const rows = (result || []) as LeyPierri[]
      setData(rows)
      try {
        const ids = rows.map((r) => r.id)
        const pending = await getPendingRemindersByRegistro('ley_pierri', ids)
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
      const { error } = await supabase.from('ley_pierri').delete().eq('id', id)
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

  const handleAddReminder = (id: string, beneficiarios: string) => {
    const existing = pendingReminders.get(id) ?? null
    setReminderTarget({
      id,
      label: beneficiarios,
      titulo: existing?.titulo ?? `Seguimiento: ${beneficiarios}`,
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
      const desc = payload.descripcion || 'Recordatorio de seguimiento Ley Pierri'
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
          tabla_origen: 'ley_pierri',
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

  const patchRow = (id: string, patch: Partial<LeyPierri>) => {
    setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
    setSelected((s) => (s?.id === id ? { ...s, ...patch } : s))
    setEditing((e) => (e?.id === id ? { ...e, ...patch } : e))
  }

  const handleEstadoChange = async (id: string, value: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('ley_pierri').update({ estado: value }).eq('id', id)
      if (error) throw error
      patchRow(id, { estado: value })
    } catch (err) {
      console.error('Error:', err)
      alert('No se pudo actualizar el estado')
    }
  }

  const handleEscribaniaChange = async (id: string, value: string) => {
    const escribania = value.trim() === '' ? null : value.trim()
    try {
      const supabase = createClient()
      const { error } = await supabase.from('ley_pierri').update({ escribania }).eq('id', id)
      if (error) throw error
      patchRow(id, { escribania: escribania ?? '' })
    } catch (err) {
      console.error('Error:', err)
      alert('No se pudo actualizar la escribanía')
    }
  }

  const cellStopDrawer = (e: { stopPropagation(): void }) => {
    e.stopPropagation()
  }

  const estadoSelectClasses = (raw: string) => {
    const t = raw?.trim() ?? ''
    if (!t) return 'bg-muted text-muted-foreground'
    if (isLeyPierriEscribaniaEstadoRow(t)) {
      return 'bg-emerald-600 font-semibold text-white shadow-sm ring-1 ring-emerald-700/40 hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700'
    }
    if (t === 'Oficina') return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
    if (t === 'Planeamiento') return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
  }

  const escribaniaSelectClasses = (raw: string | null | undefined) => {
    const t = raw?.trim() ?? ''
    if (!t) return 'bg-gray-100 text-gray-800 dark:bg-muted dark:text-muted-foreground'
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
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

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No hay trámites Ley Pierri registrados
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
              <SortHeading column="beneficiarios">Beneficiarios</SortHeading>
              <SortHeading column="estado">Estado</SortHeading>
              <SortHeading column="escribania">Escribanía</SortHeading>
              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'cursor-pointer border-b border-border transition-colors',
                  isLeyPierriEscribaniaEstadoRow(item.estado)
                    ? 'bg-emerald-100 [&>td]:bg-emerald-100 hover:bg-emerald-200 hover:[&>td]:bg-emerald-200 dark:bg-emerald-950/55 dark:[&>td]:bg-emerald-950/55 dark:hover:bg-emerald-900/65 dark:hover:[&>td]:bg-emerald-900/65'
                    : 'hover:bg-muted/50',
                )}
                onClick={() => setSelected(item)}
              >
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {formatDateDdMmYyyy(item.fecha_ingreso)}
                </td>
                <td className="px-4 py-3 font-medium">{item.beneficiarios}</td>
                <td
                  className="px-4 py-3"
                  onClick={cellStopDrawer}
                  onPointerDown={cellStopDrawer}
                >
                  <select
                    aria-label="Cambiar estado"
                    title="Cambiar estado"
                    value={item.estado}
                    disabled={!canWrite}
                    onChange={(e) => {
                      if (!canWrite) return
                      void handleEstadoChange(item.id, e.target.value)
                    }}
                    className={cn(
                      'max-w-[12.5rem] cursor-pointer rounded-full border-0 py-1 pl-2 pr-7 text-xs font-medium shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/60',
                      estadoSelectClasses(item.estado),
                    )}
                  >
                    {item.estado && !isLeyPierriEstado(item.estado) && (
                      <option value={item.estado}>{item.estado}</option>
                    )}
                    {LEY_PIERRI_ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
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
                    aria-label="Cambiar escribanía"
                    title="Cambiar escribanía"
                    value={item.escribania ?? ''}
                    disabled={!canWrite}
                    onChange={(e) => {
                      if (!canWrite) return
                      void handleEscribaniaChange(item.id, e.target.value)
                    }}
                    className={cn(
                      'max-w-[13rem] cursor-pointer rounded-full border-0 py-1 pl-2 pr-7 text-xs font-medium shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/60',
                      escribaniaSelectClasses(item.escribania),
                    )}
                  >
                    <option value="">—</option>
                    {item.escribania &&
                      !(LEY_PIERRI_ESCRIBANIAS as readonly string[]).includes(item.escribania) && (
                        <option value={item.escribania}>{item.escribania}</option>
                      )}
                    {LEY_PIERRI_ESCRIBANIAS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 justify-center">
                    {canWrite ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(item)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {item.link_documentacion && (
                      <a href={item.link_documentacion} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" title="Descargar">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  {canWrite ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddReminder(item.id, item.beneficiarios)}
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
                    </>
                  ) : null}
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
        title="Detalle — Ley Pierri"
        description={selected?.beneficiarios}
        rows={selected ? leyPierriDetailRows(selected) : []}
      />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ley Pierri</DialogTitle>
          </DialogHeader>
          {editing && (
            <LeyPierriForm
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
            ? `lp-${reminderTarget.id}-${reminderTarget.existing?.reminderId ?? 'new'}`
            : 'lp-idle'
        }
        open={reminderTarget !== null}
        onOpenChange={(open) => !open && setReminderTarget(null)}
        target={
          reminderTarget
            ? {
                id: reminderTarget.id,
                label: reminderTarget.label,
                titulo: reminderTarget.titulo,
                tablaOrigen: 'ley_pierri',
                existing: reminderTarget.existing,
              }
            : null
        }
        onSubmit={handleSaveReminder}
      />
    </>
  )
}
