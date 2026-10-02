import { LogoRueda } from '../../../components/marca/LogoRueda'
import { Card } from '../../../components/ui'

// Pantalla fuera del layout principal (sin navegación). A cargo de Pablo · Issue #11.
export function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-5">
      <LogoRueda />
      <Card className="w-full max-w-sm">
        <p className="text-texto-suave">Inicio de sesión en construcción · a cargo de Pablo · Issue #11</p>
      </Card>
    </main>
  )
}
