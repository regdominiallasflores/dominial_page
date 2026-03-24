'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  AFECTACION_ESTADOS,
  isAfectacionEstado,
} from '@/lib/afectacion-estados'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export type AfectacionEditRecord = {
  id: string
  fecha_ingreso?: string | null
  expediente?: string | null
  afectante?: string | null
  link_documentacion?: string | null
  estado?: string | null
  fecha_resolucion?: string | null
  link_descarga?: string | null
  observaciones?: string | null
  notificado?: boolean | null
  representante?: string | null
  telefono?: string | null
}

function createEmptyForm() {
  return {
    fecha_ingreso: new Date().toISOString().split('T')[0],
    expediente: '',
    afectante: '',
    link_documentacion: '',
    estado: 'Oficina',
    fecha_resolucion: '',
    link_descarga: '',
    observaciones: '',
    notificado: false,
    representante: '',
    telefono: '',
  }
}

function recordToForm(r: AfectacionEditRecord) {
  const d = (v: unknown) => (v == null || v === '' ? '' : String(v).slice(0, 10))
  return {
    fecha_ingreso: d(r.fecha_ingreso) || new Date().toISOString().split('T')[0],
    expediente: String(r.expediente ?? ''),
    afectante: String(r.afectante ?? ''),
    link_documentacion: String(r.link_documentacion ?? ''),
    estado: String(r.estado ?? ''),
    fecha_resolucion: d(r.fecha_resolucion),
    link_descarga: String(r.link_descarga ?? ''),
    observaciones: String(r.observaciones ?? ''),
    notificado: Boolean(r.notificado),
    representante: String(r.representante ?? ''),
    telefono: String(r.telefono ?? ''),
  }
}

interface Props {
  onSuccess: () => void
  onCancel?: () => void
  editRecord?: AfectacionEditRecord | null
}

export default function AfectacionForm({ onSuccess, onCancel, editRecord }: Props) {
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
        estado: formData.estado.trim() || null,
        fecha_resolucion: formData.fecha_resolucion ? formData.fecha_resolucion : null,
      }
      if (isEdit && editRecord) {
        const { error } = await supabase.from('afectacion').update(payload).eq('id', editRecord.id)
        if (error) throw error
        alert('Trámite actualizado')
      } else {
        const { error } = await supabase.from('afectacion').insert([payload])
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
          <label className="block text-sm font-medium mb-1">Expediente</label>
          <input
            type="text"
            name="expediente"
            value={formData.expediente}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Afectante</label>
          <input
            type="text"
            name="afectante"
            value={formData.afectante}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Representante</label>
          <input
            type="text"
            name="representante"
            value={formData.representante}
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
            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {!isAfectacionEstado(formData.estado) && formData.estado.trim() !== '' ? (
              <option value={formData.estado}>{formData.estado} (valor anterior)</option>
            ) : null}
            <option value="">Seleccionar estado</option>
            {AFECTACION_ESTADOS.map((est) => (
              <option key={est} value={est}>
                {est}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha Resolución</label>
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
        <label className="block text-sm font-medium mb-1">Link Descarga</label>
        <input
          type="text"
          name="link_descarga"
          value={formData.link_descarga}
          onChange={handleChange}
          placeholder="https://..."
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="notificado"
          name="notificado"
          checked={formData.notificado}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <label htmlFor="notificado" className="text-sm font-medium">
          Marcar como notificado
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
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
