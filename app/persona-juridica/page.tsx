'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PersonaJuridicaTable from '@/components/modules/PersonaJuridicaTable'
import PersonaJuridicaForm from '@/components/modules/PersonaJuridicaForm'
import ModuleListToolbar from '@/components/modules/ModuleListToolbar'

const DPPJ_HREF = 'https://www.gba.gob.ar/dppj'

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
      <div className="page-container py-6">
        <ModuleListToolbar
          title="Persona Jurídica"
          subtitle="Trámites de personas jurídicas"
          searchPlaceholder="Buscar por legajo, expediente, denominación, trámite, estado..."
          onSearchSubmit={setSearchTerm}
          onToggleForm={() => setShowForm(!showForm)}
          endActions={
            <Button
              className="w-full border-0 bg-emerald-600 px-4 font-semibold text-white shadow-md hover:bg-emerald-700 focus-visible:ring-emerald-500 sm:min-w-[10.5rem] sm:w-auto"
              asChild
            >
              <a href={DPPJ_HREF} target="_blank" rel="noopener noreferrer">
                Persona Jurídica
              </a>
            </Button>
          }
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
