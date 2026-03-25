'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import RecepcionTable from '@/components/modules/RecepcionTable'
import RecepcionForm from '@/components/modules/RecepcionForm'
import ModuleListToolbar from '@/components/modules/ModuleListToolbar'

type Props = {
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
      <ModuleListToolbar
        title="Recepción"
        subtitle="Consultas recepcionadas"
        searchPlaceholder="Buscar por nombre, tema, estado..."
        onSearchSubmit={setSearchTerm}
        onToggleForm={() => setShowForm(!showForm)}
        newEntryLabel="Nueva Consulta"
      />

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Nueva consulta de recepción</h3>
            <RecepcionForm onSuccess={handleAddSuccess} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <RecepcionTable key={refreshKey} searchTerm={searchTerm} />
    </>
  )
}
