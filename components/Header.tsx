import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-header text-header-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-header-foreground/20 shadow-lg flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Las Flores Gobierno Municipal"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-widest text-header-muted leading-tight">
              Municipalidad de Las Flores
            </span>
            <span className="text-lg font-bold leading-tight text-balance">
              Dirección de Regularización Dominial
            </span>
            <span className="text-lg font-bold leading-tight text-balance">
              y Persona Jurídica
            </span>
          </div>
        </Link>
      </div>
    </header>
  )
}
