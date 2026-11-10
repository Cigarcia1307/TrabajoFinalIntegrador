
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../../components/ui'
import { listarParticipantes } from '../../../services/participantes'
import type { Participante } from '../../../types/api'

export function GrupoPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    listarParticipantes()
      .then((datos) => {
        if (activo) setParticipantes(datos)
      })
      .catch((err) => {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudieron cargar los participantes.',
          )
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

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
          {participantesFiltrados.map((participante) => (
            <Card key={participante.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold text-tinta">
                  {participante.nombre} {participante.apellido}
                </h2>
                <span className="rounded-full bg-fondo px-3 py-1 text-xs font-semibold">
                  {participante.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <p className="text-sm text-texto-suave">
                {participante.email}
              </p>

              {participante.telefono && (
                <p className="text-sm">
                  Teléfono: {participante.telefono}
                </p>
              )}

              {participante.hijos?.length > 0 && (
                <div className="mt-2 border-t border-borde pt-2">
                  <p className="text-sm font-semibold">Beneficiarios</p>
                  {participante.hijos.map((hijo, index) => (
                    <p key={index} className="text-sm text-texto-suave">
                      {hijo.nombre}
                    </p>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
