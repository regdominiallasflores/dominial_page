'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Users, AlertCircle, ScrollText, Bell, AlertTriangle } from 'lucide-react'
import RecepcionSection from '@/components/modules/RecepcionSection'

export default function Dashboard() {
  const [stats, setStats] = useState({
    recepcion: 0,
    personaJuridica: 0,
    afectacion: 0,
    leyPierri: 0,
    recordatorios: 0,
    recordatoriosUrgentes: false,
  })
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const modules = [
    {
      id: 'recepcion',
      title: 'Recepción',
      icon: FileText,
      href: '/recepcion',
      count: stats.recepcion,
      color: 'bg-blue-600'
    },
    {
      id: 'persona-juridica',
      title: 'Persona Jurídica',
      icon: Users,
      href: '/persona-juridica',
      count: stats.personaJuridica,
      color: 'bg-purple-600'
    },
    {
      id: 'afectacion',
      title: 'Afectación',
      icon: AlertCircle,
      href: '/afectacion',
      count: stats.afectacion,
      color: 'bg-orange-600'
    },
    {
      id: 'ley-pierri',
      title: 'Ley Pierri',
      icon: ScrollText,
      href: '/ley-pierri',
      count: stats.leyPierri,
      color: 'bg-green-600'
    },
    {
      id: 'recordatorios',
      title: 'Recordatorios',
      icon: Bell,
      href: '/recordatorios',
      count: stats.recordatorios,
      color: 'bg-yellow-600'
    }
  ]

  return (
    <div className="page-container py-6">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
          {modules.map((module) => {
            const Icon = module.icon
            const isUrgentRecordatorios =
              module.id === 'recordatorios' && stats.recordatoriosUrgentes
            return (
              <Link key={module.id} href={module.href}>
                <Card
                  className={cn(
                    'h-full gap-0 py-0 hover:shadow-md transition-shadow cursor-pointer',
                    isUrgentRecordatorios &&
                      'ring-2 ring-red-500 ring-offset-2 ring-offset-background shadow-md',
                  )}
                >
                  <CardContent
                    className={cn(
                      'flex gap-3 p-4',
                      isUrgentRecordatorios ? 'flex-col' : 'items-center',
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3 min-w-0',
                        isUrgentRecordatorios && 'w-full',
                      )}
                    >
                      <div
                        className={cn(
                          'p-2 rounded-lg flex-shrink-0',
                          isUrgentRecordatorios
                            ? 'bg-red-600 animate-bell-attention'
                            : module.color,
                        )}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-2xl font-bold text-foreground leading-none">
                          {module.count}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {module.title}
                        </p>
                      </div>
                    </div>
                    {isUrgentRecordatorios && (
                      <div className="flex w-full flex-col gap-1 border-t border-red-200 pt-2.5 text-xs font-semibold text-red-600 sm:text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <AlertTriangle
                            className="h-4 w-4 shrink-0 text-red-600 animate-bell-attention"
                            aria-hidden
                          />
                          <span>Alerta</span>
                        </div>
                        <p className="text-center leading-tight">Ver Recordatorios</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <RecepcionSection onMutationSuccess={fetchStats} />
    </div>
  )
}
