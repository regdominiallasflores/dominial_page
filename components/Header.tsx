import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-header text-header-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Las Flores Gobierno Municipal"
            width={72}
            height={72}
            className="object-contain"
          />
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
