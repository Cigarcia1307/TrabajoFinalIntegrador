
import { useEffect, useMemo, useState } from 'react'
import { Baby, Mail, Pencil, Phone, Search, Users } from 'lucide-react'
import { AvatarCumpleanero, Boton, Card } from '../../../components/ui'
import {
  listarParticipantes,
  actualizarParticipante,
  type ParticipanteRequest,
} from '../../../services/participantes'
import type { Participante } from '../../../types/api'

const formularioInicial: ParticipanteRequest = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  cbuAlias: '',
}

export function GrupoPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [formulario, setFormulario] =
    useState<ParticipanteRequest>(formularioInicial)

  async function cargarParticipantes() {
    setCargando(true)
    setError('')

    try {
      const datos = await listarParticipantes()
      setParticipantes(datos)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los participantes.',
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    let activo = true

    async function cargarInicial() {
      try {
        const datos = await listarParticipantes()
        if (activo) setParticipantes(datos)
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudieron cargar los participantes.',
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargarInicial()

    return () => {
      activo = false
    }
  }, [])

  const participantesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    if (!termino) return participantes

    return participantes.filter((p) =>
      `${p.nombre} ${p.apellido} ${p.email} ${p.telefono ?? ''}`
        .toLowerCase()
        .includes(termino),
    )
  }, [participantes, busqueda])

  function comenzarEdicion(p: Participante) {
    setEditando(p.id)
    setMensaje('')
    setError('')
    setFormulario({
      nombre: p.nombre,
      apellido: p.apellido,
      email: p.email,
      telefono: p.telefono ?? '',
      cbuAlias: p.cbuAlias ?? '',
    })
  }

  function cancelarEdicion() {
    setEditando(null)
    setFormulario(formularioInicial)
  }

  async function guardarEdicion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!editando) return

    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      await actualizarParticipante(editando, formulario)
      setMensaje('Participante actualizado correctamente.')
      setEditando(null)
      setFormulario(formularioInicial)
      await cargarParticipantes()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el participante.',
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-panel border border-borde bg-superficie p-5 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-confeti-turquesa text-tinta">
              <Users size={24} aria-hidden />
            </span>
            <div>
              <h1 className="text-h1 font-extrabold">Mi grupo</h1>
              <p className="mt-1 text-texto-suave">
                Familias participantes de ColectaApp.
              </p>
            </div>
          </div>

          {!cargando && !error && (
            <div className="flex items-center gap-3 rounded-full border border-borde bg-crema px-4 py-2">
              <span className="text-h2 font-extrabold tabular-nums">
                {participantes.length}
              </span>
              <span className="text-caption font-bold text-texto-suave">
                participantes
              </span>
            </div>
          )}
        </div>
      </header>

      <label
        htmlFor="buscar-participante"
        className="relative block"
      >
        <span className="sr-only">Buscar participante</span>
        <Search
          size={20}
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-suave"
        />
        <input
          id="buscar-participante"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="w-full rounded-full border border-borde-control bg-superficie py-3 pl-12 pr-4 text-body"
        />
      </label>

      {mensaje && (
        <Card>
          <p className="text-green-700">{mensaje}</p>
        </Card>
      )}

      {cargando && (
        <p className="text-texto-suave">Cargando participantes...</p>
      )}

      {error && (
        <Card>
          <p role="alert" className="text-red-600">{error}</p>
        </Card>
      )}

      {!cargando && !error && participantesFiltrados.length === 0 && (
        <Card>
          <p className="text-texto-suave">
            {participantes.length === 0
              ? 'Todavía no hay participantes registrados.'
              : 'No encontramos participantes con esa búsqueda.'}
          </p>
        </Card>
      )}

      {!cargando && !error && participantesFiltrados.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {participantesFiltrados.map((p, index) => (
            <Card key={p.id} elevada className="flex flex-col gap-4">
              {editando === p.id ? (
                <form onSubmit={guardarEdicion} className="flex flex-col gap-3">
                  <h2 className="text-lg font-bold text-tinta">
                    Editar participante
                  </h2>

                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    Nombre
                    <input
                      required
                      value={formulario.nombre}
                      onChange={(e) =>
                        setFormulario({ ...formulario, nombre: e.target.value })
                      }
                      className="rounded-control border border-borde-control bg-superficie p-3"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    Apellido
                    <input
                      required
                      value={formulario.apellido}
                      onChange={(e) =>
                        setFormulario({ ...formulario, apellido: e.target.value })
                      }
                      className="rounded-control border border-borde-control bg-superficie p-3"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    Email
                    <input
                      type="email"
                      required
                      value={formulario.email}
                      onChange={(e) =>
                        setFormulario({ ...formulario, email: e.target.value })
                      }
                      className="rounded-control border border-borde-control bg-superficie p-3"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    Teléfono
                    <input
                      value={formulario.telefono}
                      onChange={(e) =>
                        setFormulario({ ...formulario, telefono: e.target.value })
                      }
                      className="rounded-control border border-borde-control bg-superficie p-3"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    CBU o alias
                    <input
                      value={formulario.cbuAlias}
                      onChange={(e) =>
                        setFormulario({ ...formulario, cbuAlias: e.target.value })
                      }
                      className="rounded-control border border-borde-control bg-superficie p-3"
                    />
                  </label>

                  <Boton type="submit" anchoCompleto disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </Boton>

                  <Boton
                    type="button"
                    variante="secundario"
                    anchoCompleto
                    onClick={cancelarEdicion}
                    disabled={guardando}
                  >
                    Cancelar
                  </Boton>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarCumpleanero
                        ordenEnLaRueda={index + 1}
                        nombre={p.nombre}
                        tamano="lg"
                      />
                      <div>
                        <h2 className="text-lead font-extrabold">
                          {p.nombre} {p.apellido}
                        </h2>
                        <span
                          className={`mt-1 inline-flex rounded-full px-3 py-1 text-caption font-bold ${
                            p.activo
                              ? 'bg-pagado-bg text-pagado'
                              : 'bg-no-participa-bg text-no-participa'
                          }`}
                        >
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                    <Boton
                      variante="texto"
                      onClick={() => comenzarEdicion(p)}
                      className="min-h-11 shrink-0"
                      aria-label={`Editar a ${p.nombre} ${p.apellido}`}
                      title="Editar participante"
                    >
                      <Pencil size={18} aria-hidden />
                      <span className="hidden sm:inline">Editar</span>
                    </Boton>
                  </div>

                  <dl className="grid gap-2 border-t border-borde pt-4">
                    <div className="flex items-center gap-2 text-caption text-texto-suave">
                      <Mail size={16} aria-hidden />
                      <dt className="sr-only">Email</dt>
                      <dd className="break-all">{p.email}</dd>
                    </div>
                    {p.telefono && (
                      <div className="flex items-center gap-2 text-caption text-texto-suave">
                        <Phone size={16} aria-hidden />
                        <dt className="sr-only">Teléfono</dt>
                        <dd>{p.telefono}</dd>
                      </div>
                    )}
                  </dl>

                  {p.hijos?.length > 0 && (
                    <div className="flex items-start gap-2 rounded-control bg-crema p-3">
                      <Baby size={18} className="mt-0.5 shrink-0 text-texto-suave" aria-hidden />
                      <div>
                        <p className="text-caption font-bold">Beneficiarios</p>
                        <p className="text-caption text-texto-suave">
                          {p.hijos.map((hijo) => hijo.nombre).join(' · ')}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
