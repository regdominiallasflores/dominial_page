'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  PERSONA_JURIDICA_ESTADOS,
  isPersonaJuridicaEstado,
} from '@/lib/persona-juridica-estados'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export type PersonaJuridicaEditRecord = {
  id: string
  ingreso?: string | null
  legajo?: string | null
  expediente?: string | null
  denominacion?: string | null
  tramite?: string | null
  resolucion?: string | null
  fecha_resolucion?: string | null
  observaciones?: string | null
  notificado?: boolean | null
  representante?: string | null
  telefono?: string | null
}

function createEmptyForm() {
  return {
    ingreso: new Date().toISOString().split('T')[0],
    legajo: '',
    expediente: '',
    denominacion: '',
    tramite: '',
    resolucion: 'Iniciado',
    fecha_resolucion: '',
    observaciones: '',
    notificado: false,
    representante: '',
    telefono: '',
  }
}

function recordToForm(r: PersonaJuridicaEditRecord) {
  const d = (v: unknown) => (v == null || v === '' ? '' : String(v).slice(0, 10))
  return {
    ingreso: d(r.ingreso) || new Date().toISOString().split('T')[0],
    legajo: String(r.legajo ?? ''),
    expediente: String(r.expediente ?? ''),
    denominacion: String(r.denominacion ?? ''),
    tramite: String(r.tramite ?? ''),
    resolucion: String(r.resolucion ?? ''),
    fecha_resolucion: d(r.fecha_resolucion),
    observaciones: String(r.observaciones ?? ''),
    notificado: Boolean(r.notificado),
    representante: String(r.representante ?? ''),
    telefono: String(r.telefono ?? ''),
  }
}

interface Props {
  onSuccess: () => void
  onCancel?: () => void
  editRecord?: PersonaJuridicaEditRecord | null
}

export default function PersonaJuridicaForm({ onSuccess, onCancel, editRecord }: Props) {
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
        resolucion: formData.resolucion.trim() || null,
        fecha_resolucion: formData.fecha_resolucion ? formData.fecha_resolucion : null,
      }
      if (isEdit && editRecord) {
        const { error } = await supabase.from('persona_juridica').update(payload).eq('id', editRecord.id)
        if (error) throw error
        alert('Trámite actualizado')
      } else {
        const { error } = await supabase.from('persona_juridica').insert([payload])
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
            name="ingreso"
            value={formData.ingreso}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Legajo</label>
          <input
            type="text"
            name="legajo"
            value={formData.legajo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm font-medium mb-1">Denominación</label>
          <input
            type="text"
            name="denominacion"
            value={formData.denominacion}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Trámite</label>
          <input
            type="text"
            name="tramite"
            value={formData.tramite}
            onChange={handleChange}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            name="resolucion"
            value={formData.resolucion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {!isPersonaJuridicaEstado(formData.resolucion) && formData.resolucion.trim() !== '' ? (
              <option value={formData.resolucion}>
                {formData.resolucion} (valor anterior)
              </option>
            ) : null}
            <option value="">Seleccionar estado</option>
            {PERSONA_JURIDICA_ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
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
        <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
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
