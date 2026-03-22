import Image from 'next/image'
import Link from 'next/link'
import HeaderSearch from '@/components/HeaderSearch'

export default function Header() {
  return (
    <header className="bg-header text-header-foreground shadow-md">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-header-foreground/20 shadow-lg">
            <Image
              src="/logo.png"
              alt="Las Flores Gobierno Municipal"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-medium uppercase leading-tight tracking-widest text-header-muted">
              Municipalidad de Las Flores
            </span>
            <span className="text-balance text-lg font-bold leading-tight">
              Dirección de Regularización Dominial
            </span>
            <span className="text-balance text-lg font-bold leading-tight">
              y Persona Jurídica
            </span>
          </div>
        </Link>
        <HeaderSearch />
      </div>
    </header>
  )
}
