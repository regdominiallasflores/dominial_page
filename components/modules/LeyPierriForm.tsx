'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { LEY_PIERRI_ESCRIBANIAS, LEY_PIERRI_ESTADOS } from '@/lib/ley-pierri-constants'

export type LeyPierriEditRecord = {
  id: string
  fecha_ingreso?: string | null
  beneficiarios?: string | null
  direccion?: string | null
  telefono?: string | null
  observaciones?: string | null
  link_documentacion?: string | null
  estado?: string | null
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
    estado: 'Oficina',
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
    estado: String(r.estado ?? 'Oficina'),
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
      const escribania = formData.escribania.trim() === '' ? null : formData.escribania.trim()
      const payload = {
        fecha_ingreso: formData.fecha_ingreso,
        beneficiarios: formData.beneficiarios,
        direccion: formData.direccion || null,
        telefono: formData.telefono || null,
        observaciones: formData.observaciones || null,
        link_documentacion: formData.link_documentacion || null,
        estado: formData.estado,
        escribania,
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
            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {formData.estado &&
              !(LEY_PIERRI_ESTADOS as readonly string[]).includes(formData.estado) && (
                <option value={formData.estado}>{formData.estado}</option>
              )}
            {LEY_PIERRI_ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Escribanía</label>
          <select
            name="escribania"
            value={formData.escribania}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">—</option>
            {formData.escribania &&
              !(LEY_PIERRI_ESCRIBANIAS as readonly string[]).includes(formData.escribania) && (
                <option value={formData.escribania}>{formData.escribania}</option>
              )}
            {LEY_PIERRI_ESCRIBANIAS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
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
