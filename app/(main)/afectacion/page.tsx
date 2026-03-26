'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AfectacionTable from '@/components/modules/AfectacionTable'
import AfectacionForm from '@/components/modules/AfectacionForm'
import ModuleListToolbar from '@/components/modules/ModuleListToolbar'

const REG_PROPIEDAD_HREF = `https://servicios.rpba.gob.ar/RegPropNew/signon/usernamePasswordLogin.jsp?josso_back_to=${encodeURIComponent(
  'https://servicios.rpba.gob.ar/RegPropNew/signon/index.jsp?RPBAExterno=1',
)}`

export default function AfectacionPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddSuccess = () => {
    setShowForm(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="page-container py-6">
        <ModuleListToolbar
          title="Afectación"
          subtitle="Trámites de afectación"
          searchPlaceholder="Buscar por expediente, afectante, ubicación, estado..."
          onSearchSubmit={setSearchTerm}
          onToggleForm={() => setShowForm(!showForm)}
          endActions={
            <Button
              className="w-full border-0 bg-emerald-600 px-4 font-semibold text-white shadow-md hover:bg-emerald-700 focus-visible:ring-emerald-500 sm:min-w-[10.5rem] sm:w-auto"
              asChild
            >
              <a href={REG_PROPIEDAD_HREF} target="_blank" rel="noopener noreferrer">
                Reg Propiedad
              </a>
            </Button>
          }
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
  )
}
