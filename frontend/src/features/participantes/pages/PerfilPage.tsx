
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react'
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
  const [codigoInvitacion, setCodigoInvitacion] = useState('')

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
    setCodigoInvitacion('')
    setCargando(true)

    try {
      const invitacion = await crearInvitacion({ email })

      setCodigoInvitacion(invitacion.token)
      setMensaje('Invitación creada correctamente.')
      setEmail('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la invitación.',
      )
    } finally {
      setCargando(false)
    }
  }

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigoInvitacion)
      setMensaje('Código copiado correctamente.')
      setError('')
    } catch {
      setError('No se pudo copiar el código. Copialo manualmente.')
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
      <header className="rounded-panel border border-borde bg-superficie p-5 md:p-7">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-confeti-coral text-tinta">
            <UserRound size={28} aria-hidden />
          </span>
          <div>
            <h1 className="text-h1 font-extrabold">Mi perfil</h1>
            <p className="mt-1 text-texto-suave">Tus datos y opciones de cuenta.</p>
          </div>
        </div>
      </header>

      <Card elevada className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-crema">
            <UserRound size={20} aria-hidden />
          </span>
          <div>
            <p className="text-caption text-texto-suave">Nombre completo</p>
            <p className="text-lead font-extrabold">{usuario.nombre} {usuario.apellido}</p>
          </div>
        </div>
        <dl className="grid gap-3 border-t border-borde pt-4 sm:grid-cols-2">
          <div className="rounded-control bg-crema p-3">
            <dt className="flex items-center gap-2 text-caption font-bold text-texto-suave">
              <Mail size={16} aria-hidden /> Email
            </dt>
            <dd className="mt-1 break-all font-bold">{usuario.email}</dd>
          </div>
          <div className="rounded-control bg-crema p-3">
            <dt className="flex items-center gap-2 text-caption font-bold text-texto-suave">
              <ShieldCheck size={16} aria-hidden /> Rol
            </dt>
            <dd className="mt-1 font-bold">
              {usuario.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Participante'}
            </dd>
          </div>
        </dl>
      </Card>

      {usuario.rol === 'ADMINISTRADOR' && (
        <Card elevada className="flex flex-col gap-5">
          <div>
            <h2 className="text-h3 font-extrabold">Invitar participante</h2>
            <p className="mt-1 text-caption text-texto-suave">
              Generá una invitación válida por 7 días.
            </p>
          </div>

          <form onSubmit={invitar} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 font-bold">
              Email del participante
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="participante@email.com"
                className="rounded-control border border-borde-control bg-superficie p-3"
              />
            </label>

            {mensaje && (
              <p role="status" className="rounded-control bg-pagado-bg p-3 text-caption font-bold text-pagado">{mensaje}</p>
            )}

            {error && (
              <p role="alert" className="rounded-control border-2 border-error p-3 text-caption text-error">{error}</p>
            )}

            <Boton
              type="submit"
              anchoCompleto
              disabled={cargando}
            >
              {cargando ? 'Creando invitación...' : 'Crear invitación'}
            </Boton>
          </form>

          {codigoInvitacion && (
            <div className="flex flex-col gap-3 rounded-control border border-borde bg-crema p-4">
              <h3 className="font-bold">Código de invitación</h3>

              <p className="break-all rounded-control bg-superficie p-3 text-caption tabular-nums">
                {codigoInvitacion}
              </p>

              <Boton
                type="button"
                variante="secundario"
                anchoCompleto
                onClick={copiarCodigo}
              >
                Copiar código
              </Boton>

              <p className="text-sm text-texto-suave">
                Compartí este código con la persona invitada.
                Tiene una validez de 7 días.
              </p>
            </div>
          )}
        </Card>
      )}

      <Boton variante="secundario" anchoCompleto onClick={salir}>
        <LogOut size={18} aria-hidden />
        Cerrar sesión
      </Boton>
    </section>
  )
}
