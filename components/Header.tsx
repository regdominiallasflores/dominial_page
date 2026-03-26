import HeaderSearch from '@/components/HeaderSearch'
import { InstitutionalBrandBlock } from '@/components/InstitutionalBrandBlock'

export default function Header() {
  return (
    <header className="bg-header text-header-foreground shadow-md">
      <div className="page-container flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <InstitutionalBrandBlock asLink />
        <div className="w-full min-w-0 lg:max-w-xl lg:flex-1">
          <HeaderSearch />
        </div>
      </div>
    </header>
  )
}
