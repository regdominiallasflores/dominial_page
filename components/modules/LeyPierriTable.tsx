'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Bell, Download, Send } from 'lucide-react'

interface LeyPierri {
  id: string
  fecha_ingreso: string
  beneficiarios: string
  direccion: string
  telefono: string
  observaciones: string
  link_documentacion: string
  estado: string
  enviado: boolean
  fecha_envio: string
  escribania: string
}

interface Props {
  searchTerm: string
}

export default function LeyPierriTable({ searchTerm }: Props) {
  const [data, setData] = useState<LeyPierri[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      let query = supabase.from('ley_pierri').select('*')

      if (searchTerm) {
        query = query.or(
          `beneficiarios.ilike.%${searchTerm}%,estado.ilike.%${searchTerm}%,escribania.ilike.%${searchTerm}%`
        )
      }

      const { data: result, error } = await query.order('fecha_ingreso', { ascending: false })

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
      const { error } = await supabase.from('ley_pierri').delete().eq('id', id)
      if (error) throw error
      setData(data.filter(item => item.id !== id))
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  const handleAddReminder = async (id: string, beneficiarios: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('recordatorios').insert({
        titulo: `Seguimiento: ${beneficiarios}`,
        descripcion: 'Recordatorio de seguimiento Ley Pierri',
        fecha_recordatorio: new Date().toISOString().split('T')[0],
        tabla_origen: 'ley_pierri',
        registro_id: id
      })
      if (error) throw error
      alert('Recordatorio creado exitosamente')
    } catch (err) {
      console.error('Error adding reminder:', err)
    }
  }

  const handleMarkSent = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('ley_pierri')
        .update({ enviado: true, fecha_envio: new Date().toISOString().split('T')[0] })
        .eq('id', id)
      if (error) throw error
      setData(data.map(item => item.id === id ? { ...item, enviado: true, fecha_envio: new Date().toISOString().split('T')[0] } : item))
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
          No hay trámites Ley Pierri registrados
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">Fecha</th>
            <th className="text-left px-4 py-3 font-semibold">Beneficiarios</th>
            <th className="text-left px-4 py-3 font-semibold">Estado</th>
            <th className="text-left px-4 py-3 font-semibold">Escribanía</th>
            <th className="text-left px-4 py-3 font-semibold">Enviado</th>
            <th className="text-center px-4 py-3 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-border hover:bg-muted/50">
              <td className="px-4 py-3">{item.fecha_ingreso}</td>
              <td className="px-4 py-3 font-medium">{item.beneficiarios}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  item.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {item.estado}
                </span>
              </td>
              <td className="px-4 py-3 text-xs">{item.escribania}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.enviado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.enviado ? 'Sí' : 'No'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-center">
                  {item.link_documentacion && (
                    <a href={item.link_documentacion} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" title="Descargar">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {!item.enviado && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkSent(item.id)}
                      title="Marcar como enviado"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddReminder(item.id, item.beneficiarios)}
                    title="Agregar recordatorio"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
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
