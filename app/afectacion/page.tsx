'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Plus, Search } from 'lucide-react'
import AfectacionTable from '@/components/modules/AfectacionTable'
import AfectacionForm from '@/components/modules/AfectacionForm'

export default function AfectacionPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddSuccess = () => {
    setShowForm(false)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ChevronLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Afectación</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona los trámites de afectación
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Trámite
          </Button>
        </div>

        {/* Formulario */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nuevo Trámite de Afectación</CardTitle>
              <CardDescription>
                Completa los datos del trámite de afectación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AfectacionForm onSuccess={handleAddSuccess} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        {/* Búsqueda */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por expediente, afectante, estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <AfectacionTable key={refreshKey} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
