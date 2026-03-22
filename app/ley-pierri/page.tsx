'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Plus, Search } from 'lucide-react'
import LeyPierriTable from '@/components/modules/LeyPierriTable'
import LeyPierriForm from '@/components/modules/LeyPierriForm'

export default function LeyPierriPage() {
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
            <h1 className="text-3xl font-bold text-foreground">Ley Pierri</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona los trámites según Ley Pierri
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Trámite
          </Button>
        </div>

        {/* Formulario */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nuevo Trámite Ley Pierri</CardTitle>
              <CardDescription>
                Completa los datos del trámite Ley Pierri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeyPierriForm onSuccess={handleAddSuccess} onCancel={() => setShowForm(false)} />
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
                  placeholder="Buscar por beneficiario, estado, escribanía..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <LeyPierriTable key={refreshKey} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
