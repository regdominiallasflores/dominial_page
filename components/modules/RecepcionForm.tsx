'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export type RecepcionEditRecord = {
  id: string
  fecha_ingreso?: string | null
  apellido_nombre?: string | null
  direccion?: string | null
  telefono?: string | null
  tema?: string | null
  descripcion?: string | null
  estado?: string | null
  observaciones?: string | null
  fecha_resolucion?: string | null
}

function createEmptyForm() {
  return {
    fecha_ingreso: new Date().toISOString().split('T')[0],
    apellido_nombre: '',
    direccion: '',
    telefono: '',
    tema: '',
    descripcion: '',
    estado: 'Pendiente',
    observaciones: '',
    fecha_resolucion: '',
  }
}

function recordToForm(r: RecepcionEditRecord) {
  const d = (v: unknown) => (v == null || v === '' ? '' : String(v).slice(0, 10))
  return {
    fecha_ingreso: d(r.fecha_ingreso) || new Date().toISOString().split('T')[0],
    apellido_nombre: String(r.apellido_nombre ?? ''),
    direccion: String(r.direccion ?? ''),
    telefono: String(r.telefono ?? ''),
    tema: String(r.tema ?? ''),
    descripcion: String(r.descripcion ?? ''),
    estado: String(r.estado ?? 'Pendiente'),
    observaciones: String(r.observaciones ?? ''),
    fecha_resolucion: d(r.fecha_resolucion),
  }
}

interface Props {
  onSuccess: () => void
  onCancel?: () => void
  editRecord?: RecepcionEditRecord | null
}

export default function RecepcionForm({ onSuccess, onCancel, editRecord }: Props) {
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
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      const payload = {
        ...formData,
        fecha_resolucion: formData.fecha_resolucion ? formData.fecha_resolucion : null,
      }

      if (isEdit && editRecord) {
        const { error } = await supabase.from('recepcion').update(payload).eq('id', editRecord.id)
        if (error) throw error
        alert('Trámite actualizado')
      } else {
        const { error } = await supabase.from('recepcion').insert([payload])
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
          <label className="block text-sm font-medium mb-1">Apellido y Nombre</label>
          <input
            type="text"
            name="apellido_nombre"
            value={formData.apellido_nombre}
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
        <label className="block text-sm font-medium mb-1">Tema</label>
        <input
          type="text"
          name="tema"
          value={formData.tema}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={3}
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
            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Resuelto">Resuelto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Resolución</label>
          <input
            type="date"
            name="fecha_resolucion"
            value={formData.fecha_resolucion}
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

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
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
