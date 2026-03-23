'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import LeyPierriTable from '@/components/modules/LeyPierriTable'
import LeyPierriForm from '@/components/modules/LeyPierriForm'
import ModuleListToolbar from '@/components/modules/ModuleListToolbar'

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
      <div className="container mx-auto px-4 py-6">
        <ModuleListToolbar
          title="Ley Pierri"
          subtitle="Trámites según Ley Pierri"
          searchPlaceholder="Buscar por beneficiario, estado, escribanía..."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleForm={() => setShowForm(!showForm)}
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
