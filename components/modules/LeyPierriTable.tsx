'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPendingRemindersByRegistro, type PendingReminderInfo } from '@/lib/reminders'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Bell, Download, Send, Edit2 } from 'lucide-react'
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

interface LeyPierri {
  id: string
  fecha_ingreso: string
  beneficiarios: string
  direccion: string
  telefono: string
  observaciones: string
  link_documentacion: string
  estado: string
  enviado: boolean
  fecha_envio: string
  escribania: string
}

interface Props {
  searchTerm: string
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
    { label: 'Enviado', value: formatDetailValue(r.enviado) },
    { label: 'Fecha de envío', value: formatDetailValue(r.fecha_envio) },
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
      const rows = result || []
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

  const handleMarkSent = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('ley_pierri')
        .update({ enviado: true, fecha_envio: new Date().toISOString().split('T')[0] })
        .eq('id', id)
      if (error) throw error
      const fecha = new Date().toISOString().split('T')[0]
      setData(data.map(item => item.id === id ? { ...item, enviado: true, fecha_envio: fecha } : item))
      setSelected((s) => (s?.id === id ? { ...s, enviado: true, fecha_envio: fecha } : s))
    } catch (err) {
      console.error('Error:', err)
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
              <th className="text-left px-4 py-3 font-semibold">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold">Beneficiarios</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
              <th className="text-left px-4 py-3 font-semibold">Escribanía</th>
              <th className="text-left px-4 py-3 font-semibold">Enviado</th>
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
                <td className="px-4 py-3 font-medium">{item.beneficiarios}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    item.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{item.escribania}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.enviado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.enviado ? 'Sí' : 'No'}
                  </span>
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
                    {item.link_documentacion && (
                      <a href={item.link_documentacion} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" title="Descargar">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  {!item.enviado && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkSent(item.id)}
                      title="Marcar como enviado"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddReminder(item.id, item.beneficiarios)}
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
