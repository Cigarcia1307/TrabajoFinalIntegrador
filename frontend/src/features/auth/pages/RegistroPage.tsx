
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LogoRueda } from '../../../components/marca/LogoRueda'
import { Card, Boton } from '../../../components/ui'
import { registrarse } from '../../../services/auth'

export function RegistroPage() {
  const navigate = useNavigate()

  const [datos, setDatos] = useState({
    tokenInvitacion: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    cbuAlias: '',
  })

  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  function cambiar(e: React.ChangeEvent<HTMLInputElement>) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      await registrarse(datos)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse.')
    } finally {
      setCargando(false)
    }
  }

  return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 py-8">
        <LogoRueda />

        <Card className="w-full max-w-md">
          <form onSubmit={enviar} className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-tinta">
              Crear cuenta
            </h1>

            {[
              ['tokenInvitacion', 'Código de invitación'],
              ['nombre', 'Nombre'],
              ['apellido', 'Apellido'],
              ['email', 'Email'],
              ['password', 'Contraseña'],
              ['telefono', 'Teléfono'],
              ['cbuAlias', 'CBU o alias'],
            ].map(([name, label]) => (
                <label key={name} className="flex flex-col gap-2">
                  {label}

                  <input
                      name={name}
                      type={
                        name === 'password'
                            ? 'password'
                            : name === 'email'
                                ? 'email'
                                : 'text'
                      }
                      required={!['telefono', 'cbuAlias'].includes(name)}
                      minLength={name === 'password' ? 8 : undefined}
                      value={datos[name as keyof typeof datos]}
                      onChange={cambiar}
                      className="rounded-xl border border-borde p-3"
                  />

                  {name === 'password' && (
                      <p className="text-sm text-gray-500">
                        La contraseña debe tener al menos 8 caracteres.
                      </p>
                  )}
                </label>
            ))}

            {error && (
                <p role="alert" className="text-red-600">
                  {error}
                </p>
            )}

            <Boton type="submit" anchoCompleto disabled={cargando}>
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </Boton>

            <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-center text-sm text-tinta underline hover:opacity-70"
            >
              Volver a iniciar sesión
            </button>
          </form>
        </Card>
      </main>
  )
}
