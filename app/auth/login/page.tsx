import { InstitutionalBrandBlock } from '@/components/InstitutionalBrandBlock'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-2xl ring-1 ring-border/60"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <header className="border-b border-header-foreground/10 bg-header px-4 py-4 text-header-foreground sm:px-5 sm:py-5">
          <InstitutionalBrandBlock />
        </header>
        <div className="p-6 sm:p-8">
          <h1 id="login-title" className="text-xl font-bold tracking-tight text-foreground">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acceso al sistema de expedientes. Ingresá con tu cuenta registrada.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
