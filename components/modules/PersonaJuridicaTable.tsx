'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPendingRemindersByRegistro, type PendingReminderInfo } from '@/lib/reminders'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Bell, ExternalLink, Edit2 } from 'lucide-react'
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
    { label: 'Resolución', value: formatDetailValue(r.resolucion) },
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
          `expediente.ilike.%${searchTerm}%,denominacion.ilike.%${searchTerm}%,representante.ilike.%${searchTerm}%`
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

  const handleNotify = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('persona_juridica').update({ notificado: true }).eq('id', id)
      if (error) throw error
      setData(data.map(item => item.id === id ? { ...item, notificado: true } : item))
      setSelected((s) => (s?.id === id ? { ...s, notificado: true } : s))
      alert('Notificación registrada')
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
              <th className="text-left px-4 py-3 font-semibold">Expediente</th>
              <th className="text-left px-4 py-3 font-semibold">Denominación</th>
              <th className="text-left px-4 py-3 font-semibold">Representante</th>
              <th className="text-left px-4 py-3 font-semibold">Trámite</th>
              <th className="text-left px-4 py-3 font-semibold">Notificado</th>
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
                <td className="px-4 py-3 font-medium">{item.expediente}</td>
                <td className="px-4 py-3">{item.denominacion}</td>
                <td className="px-4 py-3">{item.representante}</td>
                <td className="px-4 py-3 text-xs">{item.tramite}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.notificado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.notificado ? 'Sí' : 'No'}
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddReminder(item.id, item.denominacion)}
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
                  {!item.notificado && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleNotify(item.id)}
                      title="Marcar como notificado"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
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
