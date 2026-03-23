'use client'

import { useState } from 'react'
import type { PendingReminderInfo } from '@/lib/reminders'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type ReminderTarget = {
  id: string
  label: string
  titulo: string
  tablaOrigen: string
  /** Si existe, el diálogo abre en modo edición de ese recordatorio. */
  existing?: PendingReminderInfo | null
}

type ReminderPayload = {
  titulo: string
  descripcion: string
  fechaRecordatorio: string
}

function initialForm(target: ReminderTarget | null) {
  const today = new Date().toISOString().split('T')[0]
  if (!target) {
    return { titulo: '', descripcion: '', fechaRecordatorio: today }
  }
  const ex = target.existing
  if (ex) {
    return {
      titulo: ex.titulo,
      descripcion: ex.descripcion,
      fechaRecordatorio: ex.fecha_recordatorio,
    }
  }
  return {
    titulo: target.titulo,
    descripcion: '',
    fechaRecordatorio: today,
  }
}

export default function ReminderDialog({
  open,
  onOpenChange,
  target,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: ReminderTarget | null
  onSubmit: (payload: ReminderPayload, target: ReminderTarget) => Promise<void>
}) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState(() => initialForm(target))
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(target?.existing?.reminderId)

  const handleSave = async () => {
    if (!target) return
    if (!form.titulo.trim()) return alert('El título del recordatorio es obligatorio.')
    if (!form.fechaRecordatorio) return alert('La fecha del recordatorio es obligatoria.')
    setSaving(true)
    try {
      await onSubmit(
        {
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          fechaRecordatorio: form.fechaRecordatorio,
        },
        target,
      )
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar recordatorio' : 'Nuevo recordatorio'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica el recordatorio asociado a '
              : 'Configura qué recordar para '}
            <strong>{target?.label || 'el trámite'}</strong>.
            {!isEdit && ' Las alertas aparecerán automáticamente cuando falten 2 días o menos.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recordatorio-titulo">Título</Label>
            <Input
              id="recordatorio-titulo"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej. Revisar documentación pendiente"
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recordatorio-descripcion">Qué te debe recordar</Label>
            <Textarea
              id="recordatorio-descripcion"
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Describe brevemente la tarea a recordar..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recordatorio-fecha">Fecha objetivo</Label>
            <Input
              id="recordatorio-fecha"
              type="date"
              value={form.fechaRecordatorio}
              onChange={(e) => setForm((f) => ({ ...f, fechaRecordatorio: e.target.value }))}
              min={isEdit ? undefined : today}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar recordatorio'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
