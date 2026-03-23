'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import AfectacionTable from '@/components/modules/AfectacionTable'
import AfectacionForm from '@/components/modules/AfectacionForm'
import ModuleListToolbar from '@/components/modules/ModuleListToolbar'

export default function AfectacionPage() {
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
          title="Afectación"
          subtitle="Trámites de afectación"
          searchPlaceholder="Buscar por expediente, afectante, estado..."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleForm={() => setShowForm(!showForm)}
        />

        {showForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold">Nuevo Trámite de Afectación</h3>
              <AfectacionForm onSuccess={handleAddSuccess} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <AfectacionTable key={refreshKey} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
