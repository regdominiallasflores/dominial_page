'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface Props {
  onSuccess: () => void
}

export default function PersonaJuridicaForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ingreso: new Date().toISOString().split('T')[0],
    legajo: '',
    expediente: '',
    denominacion: '',
    tramite: '',
    resolucion: '',
    fecha_resolucion: '',
    observaciones: '',
    notificado: false,
    representante: '',
    telefono: ''
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
      const { error } = await supabase.from('persona_juridica').insert([formData])

      if (error) throw error

      alert('Trámite creado exitosamente')
      setFormData({
        ingreso: new Date().toISOString().split('T')[0],
        legajo: '',
        expediente: '',
        denominacion: '',
        tramite: '',
        resolucion: '',
        fecha_resolucion: '',
        observaciones: '',
        notificado: false,
        representante: '',
        telefono: ''
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
          <label className="block text-sm font-medium mb-1">Resolución</label>
          <input
            type="text"
            name="resolucion"
            value={formData.resolucion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
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

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Guardar Trámite
        </Button>
      </div>
    </form>
  )
}
