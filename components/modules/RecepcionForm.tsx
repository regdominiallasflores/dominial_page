'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface Props {
  onSuccess: () => void
}

export default function RecepcionForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fecha_ingreso: new Date().toISOString().split('T')[0],
    apellido_nombre: '',
    direccion: '',
    telefono: '',
    tema: '',
    descripcion: '',
    estado: 'Pendiente',
    observaciones: '',
    fecha_resolucion: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('recepcion').insert([formData])

      if (error) throw error

      alert('Trámite creado exitosamente')
      setFormData({
        fecha_ingreso: new Date().toISOString().split('T')[0],
        apellido_nombre: '',
        direccion: '',
        telefono: '',
        tema: '',
        descripcion: '',
        estado: 'Pendiente',
        observaciones: '',
        fecha_resolucion: ''
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
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
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

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Guardar Trámite
        </Button>
      </div>
    </form>
  )
}
