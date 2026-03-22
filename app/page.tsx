'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Users, AlertCircle, ScrollText, Bell } from 'lucide-react'
import RecepcionSection from '@/components/modules/RecepcionSection'

export default function Dashboard() {
  const [stats, setStats] = useState({
    recepcion: 0,
    personaJuridica: 0,
    afectacion: 0,
    leyPierri: 0,
    recordatorios: 0
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link key={module.id} href={module.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`${module.color} p-2 rounded-lg flex-shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-foreground leading-none">
                        {module.count}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {module.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <RecepcionSection onMutationSuccess={fetchStats} />
      </div>
    </div>
  )
}
