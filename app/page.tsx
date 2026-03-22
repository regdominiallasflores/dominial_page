'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, AlertCircle, ScrollText, Bell, Plus, Search } from 'lucide-react'
import RecepcionTable from '@/components/modules/RecepcionTable'
import RecepcionForm from '@/components/modules/RecepcionForm'

export default function Dashboard() {
  const [stats, setStats] = useState({
    recepcion: 0,
    personaJuridica: 0,
    afectacion: 0,
    leyPierri: 0,
    recordatorios: 0
  })
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [refreshKey])

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

  const handleAddSuccess = () => {
    setShowForm(false)
    setRefreshKey(k => k + 1)
  }

  const modules = [
    {
      id: 'recepcion',
      title: 'Recepción',
      icon: FileText,
      href: '/',
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

        {/* Recepción Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Módulo de Recepción</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona todos los trámites de recepción de la oficina
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Trámite
          </Button>
        </div>

        {/* Formulario */}
        {showForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Nuevo Trámite de Recepción</h3>
              <RecepcionForm onSuccess={handleAddSuccess} />
            </CardContent>
          </Card>
        )}

        {/* Búsqueda */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, tema, estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Recepción */}
        <RecepcionTable key={refreshKey} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
