import Image from 'next/image'
import Link from 'next/link'
import HeaderSearch from '@/components/HeaderSearch'
import { ORGANIZATION_TITLE_HEADER_LINES } from '@/lib/site-title'

export default function Header() {
  return (
    <header className="bg-header text-header-foreground shadow-md">
      <div className="page-container flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4 lg:shrink-0">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-header-foreground/20 shadow-lg sm:h-16 sm:w-16">
            <Image
              src="/logo.png"
              alt="Las Flores Gobierno Municipal"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-[0.65rem] font-medium uppercase leading-tight tracking-widest text-header-muted sm:text-xs">
              Municipalidad de Las Flores
            </span>
            {ORGANIZATION_TITLE_HEADER_LINES.map((line) => (
              <span
                key={line}
                className="text-balance text-sm font-bold leading-tight sm:text-base md:text-lg"
              >
                {line}
              </span>
            ))}
          </div>
        </Link>
        {/* En pantallas &lt; lg el buscador queda debajo del encabezado; en lg+ a la derecha */}
        <div className="w-full min-w-0 lg:max-w-xl lg:flex-1">
          <HeaderSearch />
        </div>
      </div>
    </header>
  )
}
