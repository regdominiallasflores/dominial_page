'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LeyPierriTable from '@/components/modules/LeyPierriTable'
import LeyPierriForm from '@/components/modules/LeyPierriForm'
import ModuleListToolbar from '@/components/modules/ModuleListToolbar'
import { LEY_PIERRI_PLANILLAS_DRIVE_URL } from '@/lib/ley-pierri-constants'

export default function LeyPierriPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddSuccess = () => {
    setShowForm(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container py-6">
        <ModuleListToolbar
          title="Ley Pierri"
          subtitle="Trámites según Ley Pierri"
          searchPlaceholder="Buscar por beneficiario, estado, escribanía..."
          onSearchSubmit={setSearchTerm}
          onToggleForm={() => setShowForm(!showForm)}
          endActions={
            <Button
              className="w-full border-0 bg-emerald-600 px-4 font-semibold text-white shadow-md hover:bg-emerald-700 focus-visible:ring-emerald-500 sm:min-w-[10.5rem] sm:w-auto"
              asChild
            >
              <a href={LEY_PIERRI_PLANILLAS_DRIVE_URL} target="_blank" rel="noopener noreferrer">
                Planillas
              </a>
            </Button>
          }
        />

        {showForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold">Nuevo Trámite Ley Pierri</h3>
              <LeyPierriForm onSuccess={handleAddSuccess} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <LeyPierriTable key={refreshKey} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
