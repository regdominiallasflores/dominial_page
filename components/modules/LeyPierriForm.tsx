'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export type LeyPierriEditRecord = {
  id: string
  fecha_ingreso?: string | null
  beneficiarios?: string | null
  direccion?: string | null
  telefono?: string | null
  observaciones?: string | null
  link_documentacion?: string | null
  estado?: string | null
  enviado?: boolean | null
  fecha_envio?: string | null
  escribania?: string | null
}

function createEmptyForm() {
  return {
    fecha_ingreso: new Date().toISOString().split('T')[0],
    beneficiarios: '',
    direccion: '',
    telefono: '',
    observaciones: '',
    link_documentacion: '',
    estado: 'Pendiente',
    enviado: false,
    fecha_envio: '',
    escribania: '',
  }
}

function recordToForm(r: LeyPierriEditRecord) {
  const d = (v: unknown) => (v == null || v === '' ? '' : String(v).slice(0, 10))
  return {
    fecha_ingreso: d(r.fecha_ingreso) || new Date().toISOString().split('T')[0],
    beneficiarios: String(r.beneficiarios ?? ''),
    direccion: String(r.direccion ?? ''),
    telefono: String(r.telefono ?? ''),
    observaciones: String(r.observaciones ?? ''),
    link_documentacion: String(r.link_documentacion ?? ''),
    estado: String(r.estado ?? 'Pendiente'),
    enviado: Boolean(r.enviado),
    fecha_envio: d(r.fecha_envio),
    escribania: String(r.escribania ?? ''),
  }
}

interface Props {
  onSuccess: () => void
  onCancel?: () => void
  editRecord?: LeyPierriEditRecord | null
}

export default function LeyPierriForm({ onSuccess, onCancel, editRecord }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(createEmptyForm)
  const isEdit = Boolean(editRecord?.id)

  useEffect(() => {
    if (editRecord?.id) {
      setFormData(recordToForm(editRecord))
    } else {
      setFormData(createEmptyForm())
    }
  }, [editRecord])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const payload = {
        ...formData,
        fecha_envio: formData.fecha_envio ? formData.fecha_envio : null,
      }
      if (isEdit && editRecord) {
        const { error } = await supabase.from('ley_pierri').update(payload).eq('id', editRecord.id)
        if (error) throw error
        alert('Trámite actualizado')
      } else {
        const { error } = await supabase.from('ley_pierri').insert([payload])
        if (error) throw error
        alert('Trámite creado exitosamente')
        setFormData(createEmptyForm())
      }
      onSuccess()
    } catch (err) {
      console.error('Error:', err)
      alert(isEdit ? 'Error al actualizar el trámite' : 'Error al crear el trámite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Ingreso</label>
          <input
            type="date"
            name="fecha_ingreso"
            value={formData.fecha_ingreso}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Beneficiarios</label>
          <input
            type="text"
            name="beneficiarios"
            value={formData.beneficiarios}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Link Documentación</label>
        <input
          type="text"
          name="link_documentacion"
          value={formData.link_documentacion}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completado">Completado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Escribanía</label>
          <input
            type="text"
            name="escribania"
            value={formData.escribania}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Observaciones</label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enviado"
            name="enviado"
            checked={formData.enviado}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label htmlFor="enviado" className="text-sm font-medium">
            Marcar como enviado
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Envío</label>
          <input
            type="date"
            name="fecha_envio"
            value={formData.fecha_envio}
            onChange={handleChange}
            disabled={!formData.enviado}
            className="w-full px-3 py-2 border border-input rounded-md bg-background disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Guardar Trámite'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
