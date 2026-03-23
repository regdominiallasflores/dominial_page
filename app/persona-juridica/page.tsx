'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import PersonaJuridicaTable from '@/components/modules/PersonaJuridicaTable'
import PersonaJuridicaForm from '@/components/modules/PersonaJuridicaForm'
import ModuleListToolbar from '@/components/modules/ModuleListToolbar'

export default function PersonaJuridicaPage() {
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
          title="Persona Jurídica"
          subtitle="Trámites de personas jurídicas"
          searchPlaceholder="Buscar por expediente, denominación, representante..."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleForm={() => setShowForm(!showForm)}
        />

        {showForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold">Nuevo Trámite de Persona Jurídica</h3>
              <PersonaJuridicaForm onSuccess={handleAddSuccess} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        <PersonaJuridicaTable key={refreshKey} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
