'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function HeaderSearch() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/busqueda?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

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
          className="h-9 w-full border-border bg-background pl-9 text-foreground shadow-sm"
        />
      </div>
      <Button type="submit" size="sm" variant="secondary" className="shrink-0 sm:w-auto">
        Buscar
      </Button>
    </form>
  )
}
