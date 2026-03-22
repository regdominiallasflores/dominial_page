'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface Props {
  onSuccess: () => void
}

export default function LeyPierriForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fecha_ingreso: new Date().toISOString().split('T')[0],
    beneficiarios: '',
    direccion: '',
    telefono: '',
    observaciones: '',
    link_documentacion: '',
    estado: 'Pendiente',
    enviado: false,
    fecha_envio: '',
    escribania: ''
  })

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
      const dataToInsert = {
        ...formData,
        fecha_envio: formData.fecha_envio ? formData.fecha_envio : null
      }
      const { error } = await supabase.from('ley_pierri').insert([dataToInsert])

      if (error) throw error

      alert('Trámite creado exitosamente')
      setFormData({
        fecha_ingreso: new Date().toISOString().split('T')[0],
        beneficiarios: '',
        direccion: '',
        telefono: '',
        observaciones: '',
        link_documentacion: '',
        estado: 'Pendiente',
        enviado: false,
        fecha_envio: '',
        escribania: ''
      })
      onSuccess()
    } catch (err) {
      console.error('Error:', err)
      alert('Error al crear el trámite')
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

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Guardar Trámite
        </Button>
      </div>
    </form>
  )
}
