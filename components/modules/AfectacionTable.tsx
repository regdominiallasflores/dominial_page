'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Bell, Download } from 'lucide-react'
import {
  RecordDetailDrawer,
  detailLink,
  formatDetailValue,
  type DetailRow,
} from '@/components/RecordDetailDrawer'

interface Afectacion {
  id: string
  fecha_ingreso: string
  expediente: string
  afectante: string
  link_documentacion: string
  estado: string
  fecha_resolucion: string
  link_descarga: string
  observaciones: string
  notificado: boolean
  representante: string
  telefono: string
}

interface Props {
  searchTerm: string
}

function afectacionDetailRows(r: Afectacion): DetailRow[] {
  return [
    { label: 'Fecha de ingreso', value: formatDetailValue(r.fecha_ingreso) },
    { label: 'Expediente', value: formatDetailValue(r.expediente) },
    { label: 'Afectante', value: formatDetailValue(r.afectante) },
    { label: 'Documentación', value: detailLink(r.link_documentacion) },
    { label: 'Estado', value: formatDetailValue(r.estado) },
    { label: 'Fecha de resolución', value: formatDetailValue(r.fecha_resolucion) },
    { label: 'Enlace de descarga', value: detailLink(r.link_descarga) },
    { label: 'Observaciones', value: formatDetailValue(r.observaciones) },
    { label: 'Notificado', value: formatDetailValue(r.notificado) },
    { label: 'Representante', value: formatDetailValue(r.representante) },
    { label: 'Teléfono', value: formatDetailValue(r.telefono) },
    { label: 'Identificador', value: formatDetailValue(r.id) },
  ]
}

export default function AfectacionTable({ searchTerm }: Props) {
  const [data, setData] = useState<Afectacion[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Afectacion | null>(null)

  useEffect(() => {
    fetchData()
  }, [searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      let query = supabase.from('afectacion').select('*')

      if (searchTerm) {
        query = query.or(
          `expediente.ilike.%${searchTerm}%,afectante.ilike.%${searchTerm}%,estado.ilike.%${searchTerm}%`
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
      const { error } = await supabase.from('afectacion').delete().eq('id', id)
      if (error) throw error
      setData(data.filter(item => item.id !== id))
      setSelected((s) => (s?.id === id ? null : s))
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  const handleAddReminder = async (id: string, expediente: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('recordatorios').insert({
        titulo: `Seguimiento: Exp ${expediente}`,
        descripcion: 'Recordatorio de seguimiento de afectación',
        fecha_recordatorio: new Date().toISOString().split('T')[0],
        tabla_origen: 'afectacion',
        registro_id: id
      })
      if (error) throw error
      alert('Recordatorio creado exitosamente')
    } catch (err) {
      console.error('Error adding reminder:', err)
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
          No hay trámites de afectación registrados
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold">Expediente</th>
              <th className="text-left px-4 py-3 font-semibold">Afectante</th>
              <th className="text-left px-4 py-3 font-semibold">Estado</th>
              <th className="text-left px-4 py-3 font-semibold">Representante</th>
              <th className="text-center px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelected(item)}
              >
                <td className="px-4 py-3">{item.fecha_ingreso}</td>
                <td className="px-4 py-3 font-medium">{item.expediente}</td>
                <td className="px-4 py-3">{item.afectante}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    item.estado === 'Resuelto' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.estado}
                  </span>
                </td>
                <td className="px-4 py-3">{item.representante}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 justify-center">
                    {item.link_descarga && (
                      <a href={item.link_descarga} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" title="Descargar">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddReminder(item.id, item.expediente)}
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
      <RecordDetailDrawer
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Detalle — Afectación"
        description={selected ? `Exp. ${selected.expediente}` : undefined}
        rows={selected ? afectacionDetailRows(selected) : []}
      />
    </>
  )
}
