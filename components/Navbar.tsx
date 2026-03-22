'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, Users, AlertCircle, ScrollText, Bell, Home } from 'lucide-react'

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

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

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
      </div>
    </nav>
  )
}
