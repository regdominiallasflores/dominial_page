'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

type Props = {
  title: string
  subtitle: string
  searchPlaceholder: string
  searchTerm: string
  onSearchChange: (value: string) => void
  onToggleForm: () => void
}

/**
 * Barra de módulo alineada con Recepción: título + subtítulo a la izquierda,
 * buscador centrado, botón de alta a la derecha (mismas clases que Recepción).
 */
export default function ModuleListToolbar({
  title,
  subtitle,
  searchPlaceholder,
  searchTerm,
  onSearchChange,
  onToggleForm,
}: Props) {
  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
          <div className="shrink-0 md:max-w-[min(100%,14rem)]">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex min-w-0 flex-1 justify-center">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4"
              />
            </div>
          </div>
          <div className="flex shrink-0 md:justify-end">
            <Button
              type="button"
              onClick={onToggleForm}
              className="w-full bg-blue-600 hover:bg-blue-700 md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Trámite
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
