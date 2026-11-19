
import { useEffect, useMemo, useState } from 'react'
import { Boton, Card } from '../../../components/ui'
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
    cargarParticipantes()
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
      <div>
        <h1 className="text-3xl font-bold text-tinta">Mi grupo</h1>
        <p className="mt-2 text-texto-suave">
          Familias participantes de ColectaApp.
        </p>
      </div>

      {!cargando && !error && (
        <Card className="flex flex-col gap-1">
          <p className="text-sm text-texto-suave">
            Participantes registrados
          </p>
          <p className="text-3xl font-bold text-tinta">
            {participantes.length}
          </p>
        </Card>
      )}

      <div>
        <label htmlFor="buscar-participante" className="mb-2 block font-semibold">
          Buscar participante
        </label>
        <input
          id="buscar-participante"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Nombre, apellido, email o teléfono..."
          className="w-full rounded-xl border border-borde bg-superficie p-3"
        />
      </div>

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
        <div className="grid gap-3 md:grid-cols-2">
          {participantesFiltrados.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3">
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
                      className="rounded-xl border border-borde p-3"
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
                      className="rounded-xl border border-borde p-3"
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
                      className="rounded-xl border border-borde p-3"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    Teléfono
                    <input
                      value={formulario.telefono}
                      onChange={(e) =>
                        setFormulario({ ...formulario, telefono: e.target.value })
                      }
                      className="rounded-xl border border-borde p-3"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    CBU o alias
                    <input
                      value={formulario.cbuAlias}
                      onChange={(e) =>
                        setFormulario({ ...formulario, cbuAlias: e.target.value })
                      }
                      className="rounded-xl border border-borde p-3"
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
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-tinta">
                      {p.nombre} {p.apellido}
                    </h2>
                    <span className="rounded-full bg-fondo px-3 py-1 text-xs font-semibold">
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <p className="text-sm text-texto-suave">{p.email}</p>

                  {p.telefono && (
                    <p className="text-sm">Teléfono: {p.telefono}</p>
                  )}

                  {p.hijos?.length > 0 && (
                    <div className="mt-2 border-t border-borde pt-2">
                      <p className="text-sm font-semibold">Beneficiarios</p>
                      {p.hijos.map((hijo, index) => (
                        <p key={index} className="text-sm text-texto-suave">
                          {hijo.nombre}
                        </p>
                      ))}
                    </div>
                  )}

                  <Boton
                    variante="secundario"
                    anchoCompleto
                    onClick={() => comenzarEdicion(p)}
                  >
                    Editar participante
                  </Boton>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
