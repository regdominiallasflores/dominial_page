'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecordDetailDrawer } from '@/components/RecordDetailDrawer'
import { getSearchDetailRows } from '@/lib/record-detail-rows'
import { createClient } from '@/lib/supabase/client'
import { formatDateDdMmYyyy } from '@/lib/format-date'
import { FileText, Users, AlertCircle, ScrollText, Loader2 } from 'lucide-react'

interface SearchResult {
  table: string
  record: Record<string, unknown>
  title: string
  subtitle: string
  estado?: string
  fecha?: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<SearchResult | null>(null)

  useEffect(() => {
    if (query) {
      searchAll(query)
    }
  }, [query])

  const searchAll = async (term: string) => {
    setLoading(true)
    const supabase = createClient()
    const allResults: SearchResult[] = []
    const searchTerm = `%${term}%`

    try {
      const { data: recepcion } = await supabase
        .from('recepcion')
        .select('*')
        .or(`apellido_nombre.ilike.${searchTerm},tema.ilike.${searchTerm},descripcion.ilike.${searchTerm}`)
        .limit(10)

      recepcion?.forEach((r) => {
        const row = r as Record<string, unknown>
        allResults.push({
          table: 'recepcion',
          record: row,
          title: (r.apellido_nombre as string) || 'Sin nombre',
          subtitle: (r.tema as string) || (r.descripcion as string) || '',
          estado: r.estado as string | undefined,
          fecha: r.fecha_ingreso as string | undefined,
        })
      })

      const { data: pj } = await supabase
        .from('persona_juridica')
        .select('*')
        .or(`denominacion.ilike.${searchTerm},expediente.ilike.${searchTerm},tramite.ilike.${searchTerm},ubicacion.ilike.${searchTerm}`)
        .limit(10)

      pj?.forEach((r) => {
        const row = r as Record<string, unknown>
        allResults.push({
          table: 'persona_juridica',
          record: row,
          title: (r.denominacion as string) || 'Sin denominación',
          subtitle: `Exp: ${r.expediente || '-'} | ${r.tramite || ''}`,
          fecha: r.ingreso as string | undefined,
        })
      })

      const { data: afectacion } = await supabase
        .from('afectacion')
        .select('*')
        .or(`afectante.ilike.${searchTerm},expediente.ilike.${searchTerm},ubicacion.ilike.${searchTerm}`)
        .limit(10)

      afectacion?.forEach((r) => {
        const row = r as Record<string, unknown>
        allResults.push({
          table: 'afectacion',
          record: row,
          title: (r.afectante as string) || 'Sin afectante',
          subtitle: `Exp: ${r.expediente || '-'}`,
          estado: r.estado as string | undefined,
          fecha: r.fecha_ingreso as string | undefined,
        })
      })

      const { data: pierri } = await supabase
        .from('ley_pierri')
        .select('*')
        .or(`beneficiarios.ilike.${searchTerm},direccion.ilike.${searchTerm}`)
        .limit(10)

      pierri?.forEach((r) => {
        const row = r as Record<string, unknown>
        allResults.push({
          table: 'ley_pierri',
          record: row,
          title: (r.beneficiarios as string) || 'Sin beneficiarios',
          subtitle: (r.direccion as string) || '',
          estado: r.estado as string | undefined,
          fecha: r.fecha_ingreso as string | undefined,
        })
      })

      setResults(allResults)
    } catch (err) {
      console.error('Error searching:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTableInfo = (table: string) => {
    switch (table) {
      case 'recepcion':
        return { label: 'Recepción', icon: FileText, color: 'bg-blue-100 text-blue-800' }
      case 'persona_juridica':
        return { label: 'Persona Jurídica', icon: Users, color: 'bg-purple-100 text-purple-800' }
      case 'afectacion':
        return { label: 'Afectación', icon: AlertCircle, color: 'bg-orange-100 text-orange-800' }
      case 'ley_pierri':
        return { label: 'Ley Pierri', icon: ScrollText, color: 'bg-green-100 text-green-800' }
      default:
        return { label: table, icon: FileText, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const drawerTitle = selected ? `Detalle — ${getTableInfo(selected.table).label}` : ''

  return (
    <>
      <div className="page-container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Resultados de búsqueda</h1>
          <p className="text-muted-foreground">
            {query ? `Mostrando resultados para "${query}"` : 'Ingresa un término de búsqueda'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => {
              const tableInfo = getTableInfo(result.table)
              const Icon = tableInfo.icon
              const id = String(result.record.id ?? '')
              return (
                <Card
                  key={`${result.table}-${id}`}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => setSelected(result)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelected(result)
                    }
                  }}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="rounded-lg bg-muted p-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{result.title}</p>
                        <Badge variant="secondary" className={tableInfo.color}>
                          {tableInfo.label}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{result.subtitle}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {result.estado && (
                        <Badge variant={result.estado === 'Pendiente' ? 'outline' : 'default'}>
                          {result.estado}
                        </Badge>
                      )}
                      {result.fecha && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateDdMmYyyy(result.fecha)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : query ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron resultados para &quot;{query}&quot;</p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <RecordDetailDrawer
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={drawerTitle}
        description={selected?.title}
        rows={selected ? getSearchDetailRows(selected.table, selected.record) : []}
      />
    </>
  )
}

export default function BusquedaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
