'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { FileText, Users, AlertCircle, ScrollText, Bell, Home, Menu } from 'lucide-react'

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

  const linkClass = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="page-container">
        {/* Móvil / tablet: menú hamburguesa */}
        <div className="flex h-14 items-center gap-2 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[min(100%,20rem)] flex-col gap-0 p-0 sm:max-w-sm">
              <SheetHeader className="border-b px-4 py-4 text-left">
                <SheetTitle className="text-base">Navegación</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <SheetClose asChild key={item.href}>
                      <Link href={item.href} className={linkClass(isActive)}>
                        <Icon className="h-5 w-5 shrink-0" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <span className="truncate text-sm font-medium text-muted-foreground">Menú principal</span>
        </div>

        {/* Escritorio: barra horizontal con scroll suave por si faltara espacio */}
        <div className="hidden h-14 items-center gap-1 overflow-x-auto overflow-y-hidden py-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link key={item.href} href={item.href} className="shrink-0">
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
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
