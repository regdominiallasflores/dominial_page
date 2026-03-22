'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search } from 'lucide-react'
import RecepcionTable from '@/components/modules/RecepcionTable'
import RecepcionForm from '@/components/modules/RecepcionForm'

export default function RecepcionPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddSuccess = () => {
    setShowForm(false)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Módulo de Recepción</h1>
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

        {/* Tabla */}
        <RecepcionTable key={refreshKey} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
