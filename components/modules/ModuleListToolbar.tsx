'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppRole } from '@/components/auth/useAppRole'

type Props = {
  title: string
  subtitle: string
  searchPlaceholder: string
  onSearchSubmit: (query: string) => void
  onToggleForm: () => void
  newEntryLabel?: string
  endActions?: ReactNode
}

const btnCompact =
  'h-9 min-h-9 px-3 text-sm font-semibold shadow-sm lg:px-4'

export default function ModuleListToolbar({
  title,
  subtitle,
  searchPlaceholder,
  onSearchSubmit,
  onToggleForm,
  newEntryLabel = 'Nuevo Trámite',
  endActions,
}: Props) {
  const [draft, setDraft] = useState('')
  const { role, loading } = useAppRole()

  const canWrite = role === 'admin' || role === 'superAdmin'
  const showCreateButton = canWrite || loading

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearchSubmit(draft.trim())
    setDraft('')
  }

  const clearDraft = () => setDraft('')

  return (
    <Card className="mb-6 min-w-0 gap-0 py-0">
      <CardContent className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
          <div className="shrink-0 text-center lg:w-44 lg:text-left xl:w-52">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          </div>

          <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-3 lg:mx-0 lg:max-w-none lg:flex-row lg:flex-nowrap lg:items-center lg:gap-4">
            <form
              onSubmit={handleSubmit}
              className="min-w-0 w-full shrink-0 lg:flex-1"
            >
              <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="relative min-w-0 w-full flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className={cn(
                      'h-9 w-full border-border bg-background pl-9 text-foreground shadow-sm',
                      draft.length > 0 ? 'pr-9' : 'pr-3',
                    )}
                    autoComplete="off"
                  />
                  {draft.length > 0 && (
                    <button
                      type="button"
                      onClick={clearDraft}
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Borrar texto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  size="default"
                  className={cn(
                    'h-9 shrink-0 border-border bg-background font-medium text-foreground shadow-sm',
                    'hover:bg-muted/70 hover:text-foreground',
                    'dark:bg-input/30 dark:hover:bg-input/55',
                    'w-full sm:w-auto',
                  )}
                >
                  Buscar
                </Button>
              </div>
            </form>

            <div
              className={cn(
                'w-full min-w-0 shrink-0 gap-2 lg:w-auto lg:items-center lg:justify-end',
                endActions && showCreateButton
                  ? 'grid grid-cols-2 lg:flex lg:flex-row'
                  : 'flex flex-col lg:flex-row',
              )}
            >
              {showCreateButton ? (
                <Button
                  type="button"
                  onClick={onToggleForm}
                  className={cn(
                    'min-w-0 bg-blue-600 text-white hover:bg-blue-700',
                    btnCompact,
                    'w-full lg:w-auto lg:shrink-0',
                  )}
                >
                  <Plus className="mr-1 h-4 w-4 shrink-0 sm:mr-2" />
                  <span className="truncate">{newEntryLabel}</span>
                </Button>
              ) : null}
              {endActions ? (
                <div
                  className={cn(
                    'min-w-0 [&_a]:inline-flex [&_a]:h-9 [&_a]:min-h-9 [&_a]:w-full [&_a]:items-center [&_a]:justify-center [&_a]:truncate [&_a]:rounded-md [&_a]:px-3 [&_a]:text-sm [&_a]:font-semibold',
                    'lg:[&_a]:w-auto lg:[&_a]:shrink-0',
                  )}
                >
                  {endActions}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
