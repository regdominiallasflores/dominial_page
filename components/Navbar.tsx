'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import {
  FileText,
  Users,
  AlertCircle,
  ScrollText,
  Bell,
  Home,
  Menu,
  UserPlus,
  LogOut,
} from 'lucide-react'
import { useAppRole } from '@/components/auth/useAppRole'
import { createClient } from '@/lib/supabase/client'
import { useMemo } from 'react'

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
  const { role, email, displayName, loading: roleLoading, error: roleError } = useAppRole()
  const supabase = useMemo(() => createClient(), [])

  const linkClass = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`

  const BOOTSTRAP_SUPERADMIN_EMAIL = 'regdominial@lasflores.gob.ar'
  const isBootstrapEmail =
    (email ?? '').toLowerCase() === BOOTSTRAP_SUPERADMIN_EMAIL.toLowerCase()

  const showAdminUsers = role === 'admin' || role === 'superAdmin' || isBootstrapEmail
  const adminUsersItem = { href: '/admin/users', label: 'Usuarios', icon: UserPlus }
  const AdminUsersIcon = adminUsersItem.icon

  const userInitial =
    (displayName?.trim()?.[0] ?? email?.trim()?.[0] ?? '?').toUpperCase()

  async function onLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const showAccountMenu = Boolean(email) && !roleLoading

  const AccountSlot =
    roleLoading ? (
      <div
        className="ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50"
        aria-hidden
        title="Cargando sesión…"
      >
        <span className="size-4 animate-pulse rounded-full bg-muted-foreground/40" />
      </div>
    ) : email ? null : (
      <Button type="button" variant="outline" size="sm" className="ml-auto shrink-0" asChild>
        <Link href="/auth/login">Iniciar sesión</Link>
      </Button>
    )

  const AvatarMenu = showAccountMenu ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="ml-auto inline-flex size-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
          aria-label="Cuenta"
          title="Cuenta"
        >
          <span className="text-xs font-bold">{userInitial}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel className="py-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold leading-tight">{email ?? '—'}</span>
            <span className="text-xs font-medium text-muted-foreground leading-tight">
              {role ?? (roleError ? 'No se pudo leer el rol' : '—')}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showAdminUsers ? (
          <>
            <DropdownMenuItem onSelect={() => router.push('/admin/users')}>
              <AdminUsersIcon />
              <span>Usuarios</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem variant="destructive" onSelect={onLogout}>
          <LogOut />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="page-container">
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
                {showAdminUsers ? (
                  <SheetClose asChild>
                    <Link
                      href={adminUsersItem.href}
                      className={linkClass(
                        pathname === adminUsersItem.href ||
                          (pathname.startsWith('/admin') && adminUsersItem.href === '/admin/users'),
                      )}
                    >
                      <AdminUsersIcon className="h-5 w-5 shrink-0" />
                      {adminUsersItem.label}
                    </Link>
                  </SheetClose>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
          <span className="truncate text-sm font-medium text-muted-foreground">Menú principal</span>
          {AvatarMenu ?? AccountSlot}
        </div>

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
          {AvatarMenu ? (
            <div className="ml-auto">{AvatarMenu}</div>
          ) : (
            <div className="ml-auto">{AccountSlot}</div>
          )}
        </div>
      </div>
    </nav>
  )
}
