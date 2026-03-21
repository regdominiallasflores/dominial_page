'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, AlertCircle, ScrollText, Bell } from 'lucide-react'

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
      description: 'Gestión de trámites de recepción',
      icon: FileText,
      href: '/recepcion',
      count: stats.recepcion,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'persona-juridica',
      title: 'Persona Jurídica',
      description: 'Trámites de personas jurídicas',
      icon: Users,
      href: '/persona-juridica',
      count: stats.personaJuridica,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'afectacion',
      title: 'Afectación',
      description: 'Gestión de afectaciones',
      icon: AlertCircle,
      href: '/afectacion',
      count: stats.afectacion,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'ley-pierri',
      title: 'Ley Pierri',
      description: 'Trámites según Ley Pierri',
      icon: ScrollText,
      href: '/ley-pierri',
      count: stats.leyPierri,
      color: 'from-green-500 to-green-600'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Sistema de Gestión de Expedientes
          </h1>
          <p className="text-muted-foreground">
            Administración de trámites y expedientes de la oficina
          </p>
        </div>

        {/* Recordatorios Alert */}
        {stats.recordatorios > 0 && (
          <Card className="mb-8 border-l-4 border-l-yellow-500 bg-yellow-50">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    Tienes {stats.recordatorios} recordatorio{stats.recordatorios > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-yellow-800">
                    Revisa los recordatorios pendientes
                  </p>
                </div>
              </div>
              <Link href="/recordatorios">
                <Button variant="outline" size="sm">
                  Ver recordatorios
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Módulos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link key={module.id} href={module.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`bg-gradient-to-r ${module.color} p-3 rounded-lg w-fit mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">
                      {module.count}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      expedientes activos
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Búsqueda Global */}
        <Card>
          <CardHeader>
            <CardTitle>Búsqueda Global</CardTitle>
            <CardDescription>
              Busca expedientes en todos los módulos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-2">
              <input
                type="text"
                placeholder="Ingresa número de expediente, nombre o descripción..."
                className="flex-1 px-4 py-2 border border-input rounded-md bg-background"
              />
              <Button type="submit">Buscar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
