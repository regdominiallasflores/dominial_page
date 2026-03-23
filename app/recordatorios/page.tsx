'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Trash2, CheckCircle2, Circle } from 'lucide-react'

interface Recordatorio {
  id: string
  titulo: string
  descripcion: string
  fecha_recordatorio: string
  tabla_origen: string
  completado: boolean
}

export default function RecordatoriosPage() {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'pendientes' | 'completados'>('pendientes')

  useEffect(() => {
    fetchRecordatorios()
  }, [filter])

  const fetchRecordatorios = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      let query = supabase.from('recordatorios').select('*').order('fecha_recordatorio', { ascending: true })

      if (filter === 'pendientes') {
        query = query.eq('completado', false)
      } else if (filter === 'completados') {
        query = query.eq('completado', true)
      }

      const { data, error } = await query

      if (error) throw error
      setRecordatorios(data || [])
    } catch (err) {
      console.error('Error fetching recordatorios:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (id: string, completado: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('recordatorios')
        .update({ completado: !completado })
        .eq('id', id)

      if (error) throw error
      setRecordatorios(recordatorios.map(r =>
        r.id === id ? { ...r, completado: !completado } : r
      ))
    } catch (err) {
      console.error('Error updating recordatorio:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este recordatorio?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('recordatorios').delete().eq('id', id)

      if (error) throw error
      setRecordatorios(recordatorios.filter(r => r.id !== id))
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  const pendientes = recordatorios.filter(r => !r.completado)
  const completados = recordatorios.filter(r => r.completado)
  const getDaysToReminder = (dateStr: string) => {
    const target = new Date(`${dateStr}T00:00:00`)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffMs = target.getTime() - today.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Recordatorios</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos tus recordatorios de seguimiento
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-8">
          {(['todos', 'pendientes', 'completados'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'todos' && `Todos (${recordatorios.length})`}
              {f === 'pendientes' && `Pendientes (${pendientes.length})`}
              {f === 'completados' && `Completados (${completados.length})`}
            </Button>
          ))}
        </div>

        {/* Contenido */}
        {loading ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Cargando recordatorios...
            </CardContent>
          </Card>
        ) : recordatorios.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground py-12">
              {filter === 'pendientes' && 'No tienes recordatorios pendientes'}
              {filter === 'completados' && 'No tienes recordatorios completados'}
              {filter === 'todos' && 'No tienes recordatorios'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recordatorios.map(recordatorio => (
              <Card key={recordatorio.id} className={recordatorio.completado ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => handleToggleComplete(recordatorio.id, recordatorio.completado)}
                          className="flex-shrink-0"
                        >
                          {recordatorio.completado ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                        </button>
                        <div>
                          <h3 className={`font-semibold ${recordatorio.completado ? 'line-through text-muted-foreground' : ''}`}>
                            {recordatorio.titulo}
                          </h3>
                          {recordatorio.descripcion && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {recordatorio.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4 ml-9 items-center flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          Fecha: <strong>{recordatorio.fecha_recordatorio}</strong>
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {recordatorio.tabla_origen}
                        </span>
                        {!recordatorio.completado && (() => {
                          const days = getDaysToReminder(recordatorio.fecha_recordatorio)
                          if (days < 0) {
                            return (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                Vencido ({Math.abs(days)} días)
                              </span>
                            )
                          }
                          if (days <= 2) {
                            return (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                Alerta: faltan {days} día{days === 1 ? '' : 's'}
                              </span>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(recordatorio.id)}
                      className="text-red-600 hover:text-red-700 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
