
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, Boton } from '../../../components/ui'
import {
  obtenerUsuarioActual,
  cerrarSesion,
  crearInvitacion,
} from '../../../services/auth'
import type { UsuarioActual } from '../../../types/api'

export function PerfilPage() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null)
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    obtenerUsuarioActual()
      .then(setUsuario)
      .catch(() => {
        cerrarSesion()
        navigate('/login', { replace: true })
      })
  }, [navigate])

  async function invitar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMensaje('')
    setError('')
    setCargando(true)

    try {
      await crearInvitacion({ email })
      setMensaje('Invitación creada correctamente.')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la invitación.')
    } finally {
      setCargando(false)
    }
  }

  function salir() {
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  if (!usuario) {
    return <p className="p-8 text-center">Cargando perfil...</p>
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-tinta">Mi perfil</h1>

      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-texto-suave">Nombre completo</p>
          <p className="font-bold">{usuario.nombre} {usuario.apellido}</p>
        </div>

        <div>
          <p className="text-sm text-texto-suave">Email</p>
          <p className="font-semibold">{usuario.email}</p>
        </div>

        <div>
          <p className="text-sm text-texto-suave">Rol</p>
          <p className="font-semibold">
            {usuario.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Participante'}
          </p>
        </div>
      </Card>

      {usuario.rol === 'ADMINISTRADOR' && (
        <Card className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-tinta">
            Invitar participante
          </h2>

          <form onSubmit={invitar} className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              Email del participante
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="participante@email.com"
                className="rounded-xl border border-borde p-3"
              />
            </label>

            {mensaje && <p className="text-green-700">{mensaje}</p>}
            {error && <p role="alert" className="text-red-600">{error}</p>}

            <Boton type="submit" anchoCompleto disabled={cargando}>
              {cargando ? 'Creando invitación...' : 'Crear invitación'}
            </Boton>
          </form>
        </Card>
      )}

      <Boton variante="secundario" anchoCompleto onClick={salir}>
        Cerrar sesión
      </Boton>
    </section>
  )
}
