'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Bell, ExternalLink } from 'lucide-react'

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

export default function PersonaJuridicaTable({ searchTerm }: Props) {
  const [data, setData] = useState<PersonaJuridica[]>([])
  const [loading, setLoading] = useState(true)

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
      setData(result || [])
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
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  const handleAddReminder = async (id: string, denominacion: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('recordatorios').insert({
        titulo: `Seguimiento: ${denominacion}`,
        descripcion: 'Recordatorio de seguimiento de persona jurídica',
        fecha_recordatorio: new Date().toISOString().split('T')[0],
        tabla_origen: 'persona_juridica',
        registro_id: id
      })
      if (error) throw error
      alert('Recordatorio creado exitosamente')
    } catch (err) {
      console.error('Error adding reminder:', err)
    }
  }

  const handleNotify = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('persona_juridica').update({ notificado: true }).eq('id', id)
      if (error) throw error
      setData(data.map(item => item.id === id ? { ...item, notificado: true } : item))
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
            <tr key={item.id} className="border-b border-border hover:bg-muted/50">
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
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddReminder(item.id, item.denominacion)}
                    title="Agregar recordatorio"
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
  )
}
