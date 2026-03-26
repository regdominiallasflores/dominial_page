'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppRole } from '@/components/auth/useAppRole'
import { formatDateDdMmYyyy } from '@/lib/format-date'

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
  const { role, loading: roleLoading } = useAppRole()

  const canWrite = role === 'admin' || role === 'superAdmin' || roleLoading

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
      setRecordatorios((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completado: !completado } : r)),
      )
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
      setRecordatorios((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  const pendientes = recordatorios.filter(r => !r.completado)
  const completados = recordatorios.filter(r => r.completado)

  const recordatoriosOrdenados = useMemo(() => {
    const pend = recordatorios.filter((r) => !r.completado)
    const done = recordatorios.filter((r) => r.completado)
    const byFecha = (a: Recordatorio, b: Recordatorio) =>
      (a.fecha_recordatorio || '').localeCompare(b.fecha_recordatorio || '')
    pend.sort(byFecha)
    done.sort(byFecha)
    return [...pend, ...done]
  }, [recordatorios])

  const getDaysToReminder = (dateStr: string) => {
    const target = new Date(`${dateStr}T00:00:00`)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffMs = target.getTime() - today.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="page-container py-8">
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

        <div className="mb-8 flex flex-wrap gap-2">
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
            {recordatoriosOrdenados.map((recordatorio) => (
              <Card
                key={recordatorio.id}
                className={cn(
                  recordatorio.completado &&
                    'border-emerald-200 bg-emerald-50/95 shadow-md ring-1 ring-emerald-200/90 dark:border-emerald-800 dark:bg-emerald-950/45 dark:ring-emerald-800/70',
                )}
              >
                <CardContent className="min-w-0">
                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                          type="button"
                          disabled={!canWrite}
                          onClick={() => {
                            if (!canWrite) return
                            handleToggleComplete(recordatorio.id, recordatorio.completado)
                          }}
                          className="shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={
                            recordatorio.completado
                              ? 'Marcar como pendiente'
                              : 'Marcar como completada'
                          }
                        >
                          {recordatorio.completado ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                        </button>
                        <h3
                          className={cn(
                            'min-w-0 flex-1 font-semibold leading-snug',
                            recordatorio.completado &&
                              'text-muted-foreground line-through decoration-muted-foreground/80',
                          )}
                        >
                          {recordatorio.titulo}
                        </h3>
                      </div>
                      {canWrite ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(recordatorio.id)}
                          className="w-full shrink-0 gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto dark:border-red-900/50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="size-4 shrink-0" />
                          Quitar recordatorio
                        </Button>
                      ) : null}
                    </div>
                    {recordatorio.descripcion && (
                      <p
                        className={cn(
                          'ml-9 text-sm text-muted-foreground',
                          recordatorio.completado &&
                            'text-muted-foreground line-through decoration-muted-foreground/70',
                        )}
                      >
                        {recordatorio.descripcion}
                      </p>
                    )}
                    <div className="ml-9 flex flex-wrap items-center gap-3">
                      <span
                        className={cn(
                          'text-xs text-muted-foreground',
                          recordatorio.completado &&
                            'line-through decoration-muted-foreground/70',
                        )}
                      >
                        Fecha:{' '}
                        <strong>{formatDateDdMmYyyy(recordatorio.fecha_recordatorio)}</strong>
                      </span>
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 text-xs',
                          recordatorio.completado
                            ? 'bg-muted text-muted-foreground line-through'
                            : 'bg-blue-100 text-blue-800',
                        )}
                      >
                        {recordatorio.tabla_origen}
                      </span>
                      {recordatorio.completado && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          Completada
                        </span>
                      )}
                      {!recordatorio.completado && (() => {
                        const days = getDaysToReminder(recordatorio.fecha_recordatorio)
                        if (days < 0) {
                          return (
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                              Vencido ({Math.abs(days)} días)
                            </span>
                          )
                        }
                        if (days <= 2) {
                          return (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                              Alerta: faltan {days} día{days === 1 ? '' : 's'}
                            </span>
                          )
                        }
                        return null
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}
