
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LogoRueda } from '../../../components/marca/LogoRueda'
import { Boton, Card } from '../../../components/ui'
import { iniciarSesion } from '../../../services/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      await iniciarSesion({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-5">
      <LogoRueda />

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <h1 className="text-xl font-bold">Iniciar sesión</h1>

          <label className="flex flex-col gap-2">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border p-3"
              placeholder="tu@email.com"
            />
          </label>

          <label className="flex flex-col gap-2">
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border p-3"
              placeholder="Tu contraseña"
            />
          </label>

          {error && <p className="text-red-600">{error}</p>}

          <Boton type="submit" anchoCompleto disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </Boton>
          <button
              type="button"
              onClick={() => navigate('/registro')}
              className="text-tinta underline"
            >
              ¿Tenés una invitación? Crear cuenta
            </button>
        </form>
      </Card>
    </main>
  )
}
