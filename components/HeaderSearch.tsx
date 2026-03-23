'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HeaderSearch() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchTerm.trim()
    if (q) {
      router.push(`/busqueda?q=${encodeURIComponent(q)}`)
      setSearchTerm('')
    }
  }

  const clear = () => setSearchTerm('')

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end md:max-w-xl md:flex-1"
    >
      <div className="relative min-w-0 flex-1 sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar expediente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            'h-9 w-full border-border bg-background pl-9 text-foreground shadow-sm',
            searchTerm.trim() ? 'pr-9' : 'pr-3',
          )}
        />
        {searchTerm.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Borrar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" size="sm" variant="secondary" className="shrink-0 sm:w-auto">
        Buscar
      </Button>
    </form>
  )
}
