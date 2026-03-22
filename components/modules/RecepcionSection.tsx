'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import RecepcionTable from '@/components/modules/RecepcionTable'
import RecepcionForm from '@/components/modules/RecepcionForm'

type Props = {
  /** Ej. en Inicio: volver a cargar estadísticas tras un alta */
  onMutationSuccess?: () => void
}

export default function RecepcionSection({ onMutationSuccess }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddSuccess = () => {
    setShowForm(false)
    setRefreshKey((k) => k + 1)
    onMutationSuccess?.()
  }

  return (
    <>
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
            <div className="shrink-0 md:max-w-[min(100%,14rem)]">
              <h2 className="text-xl font-bold text-foreground">Recepción</h2>
              <p className="text-sm text-muted-foreground">Consultas recepcionadas</p>
            </div>
            <div className="flex flex-1 justify-center min-w-0">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, tema, estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
            <div className="shrink-0 flex md:justify-end">
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Trámite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Nuevo Trámite de Recepción</h3>
            <RecepcionForm onSuccess={handleAddSuccess} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <RecepcionTable key={refreshKey} searchTerm={searchTerm} />
    </>
  )
}
