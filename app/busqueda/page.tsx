'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { FileText, Users, AlertCircle, ScrollText, Loader2 } from 'lucide-react'

interface SearchResult {
  id: string
  table: string
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
      // Buscar en Recepción
      const { data: recepcion } = await supabase
        .from('recepcion')
        .select('*')
        .or(`apellido_nombre.ilike.${searchTerm},tema.ilike.${searchTerm},descripcion.ilike.${searchTerm}`)
        .limit(10)

      recepcion?.forEach(r => {
        allResults.push({
          id: r.id,
          table: 'recepcion',
          title: r.apellido_nombre || 'Sin nombre',
          subtitle: r.tema || r.descripcion || '',
          estado: r.estado,
          fecha: r.fecha_ingreso
        })
      })

      // Buscar en Persona Jurídica
      const { data: pj } = await supabase
        .from('persona_juridica')
        .select('*')
        .or(`denominacion.ilike.${searchTerm},expediente.ilike.${searchTerm},tramite.ilike.${searchTerm}`)
        .limit(10)

      pj?.forEach(r => {
        allResults.push({
          id: r.id,
          table: 'persona_juridica',
          title: r.denominacion || 'Sin denominación',
          subtitle: `Exp: ${r.expediente || '-'} | ${r.tramite || ''}`,
          fecha: r.ingreso
        })
      })

      // Buscar en Afectación
      const { data: afectacion } = await supabase
        .from('afectacion')
        .select('*')
        .or(`afectante.ilike.${searchTerm},expediente.ilike.${searchTerm}`)
        .limit(10)

      afectacion?.forEach(r => {
        allResults.push({
          id: r.id,
          table: 'afectacion',
          title: r.afectante || 'Sin afectante',
          subtitle: `Exp: ${r.expediente || '-'}`,
          estado: r.estado,
          fecha: r.fecha_ingreso
        })
      })

      // Buscar en Ley Pierri
      const { data: pierri } = await supabase
        .from('ley_pierri')
        .select('*')
        .or(`beneficiarios.ilike.${searchTerm},direccion.ilike.${searchTerm}`)
        .limit(10)

      pierri?.forEach(r => {
        allResults.push({
          id: r.id,
          table: 'ley_pierri',
          title: r.beneficiarios || 'Sin beneficiarios',
          subtitle: r.direccion || '',
          estado: r.estado,
          fecha: r.fecha_ingreso
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
        return { label: 'Recepción', icon: FileText, href: '/recepcion', color: 'bg-blue-100 text-blue-800' }
      case 'persona_juridica':
        return { label: 'Persona Jurídica', icon: Users, href: '/persona-juridica', color: 'bg-purple-100 text-purple-800' }
      case 'afectacion':
        return { label: 'Afectación', icon: AlertCircle, href: '/afectacion', color: 'bg-orange-100 text-orange-800' }
      case 'ley_pierri':
        return { label: 'Ley Pierri', icon: ScrollText, href: '/ley-pierri', color: 'bg-green-100 text-green-800' }
      default:
        return { label: table, icon: FileText, href: '/', color: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
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
              return (
                <Link key={`${result.table}-${result.id}`} href={tableInfo.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="py-4 flex items-center gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground truncate">{result.title}</p>
                          <Badge variant="secondary" className={tableInfo.color}>
                            {tableInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {result.estado && (
                          <Badge variant={result.estado === 'Pendiente' ? 'outline' : 'default'}>
                            {result.estado}
                          </Badge>
                        )}
                        {result.fecha && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(result.fecha).toLocaleDateString('es-AR')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : query ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron resultados para "{query}"</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export default function BusquedaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
