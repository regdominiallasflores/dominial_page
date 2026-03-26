import Image from 'next/image'
import Link from 'next/link'
import { ORGANIZATION_TITLE_HEADER_LINES } from '@/lib/site-title'

type Props = {
  /** En el header principal enlaza al inicio; en login es solo identidad. */
  asLink?: boolean
  className?: string
}

export function InstitutionalBrandBlock({ asLink = false, className = '' }: Props) {
  const inner = (
    <>
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
    </>
  )

  const wrapClass = `flex min-w-0 items-center gap-3 sm:gap-4 lg:shrink-0 ${className}`

  if (asLink) {
    return (
      <Link href="/" className={wrapClass}>
        {inner}
      </Link>
    )
  }

  return <div className={wrapClass}>{inner}</div>
}
