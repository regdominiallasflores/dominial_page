'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Users, AlertCircle, ScrollText, Bell, Search, Home } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/recepcion', label: 'Recepción', icon: FileText },
  { href: '/persona-juridica', label: 'Persona Jurídica', icon: Users },
  { href: '/afectacion', label: 'Afectación', icon: AlertCircle },
  { href: '/ley-pierri', label: 'Ley Pierri', icon: ScrollText },
  { href: '/recordatorios', label: 'Recordatorios', icon: Bell },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/busqueda?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-14">
          {/* Navigation Links */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`flex items-center gap-2 whitespace-nowrap ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48 md:w-64 h-9"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary">
              Buscar
            </Button>
          </form>
        </div>
      </div>
    </nav>
  )
}
