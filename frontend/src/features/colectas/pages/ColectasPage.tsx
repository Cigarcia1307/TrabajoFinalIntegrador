
import { useEffect, useState } from 'react'
import type { Colecta, Participante } from '../../../types/api'
import { listarColectas } from '../../../services/colectas'
import { listarParticipantes } from '../../../services/participantes'

export function ColectasPage() {
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [colectas, setColectas] = useState<Colecta[]>([])
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true

    async function cargar() {
      setCargando(true)
      setError('')

      try {
        const [datosColectas, datosParticipantes] =
            await Promise.all([
              listarColectas(anio),
              listarParticipantes()
            ])

        if (vigente) {
          setColectas(datosColectas)
          setParticipantes(datosParticipantes)
        }
      } catch {
        if (vigente) {
          setError('No se pudieron cargar las colectas.')
          setColectas([])
        }
      } finally {
        if (vigente) {
          setCargando(false)
        }
      }
    }

    void cargar()

    return () => {
      vigente = false
    }
  }, [anio])

  const obtenerNombreRecaudador = (id: string) => {
    if (!id) return 'Sin asignar'

    const participante = participantes.find(
        p => p.id === id
    )

    if (!participante) {
      return 'Recaudador no encontrado'
    }

    return `${participante.nombre} ${participante.apellido}`
  }

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Sin fecha'

    const partes = fecha.split('-')

    if (partes.length !== 3) return fecha

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto ?? 0)
  }

  return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tinta">
              Colectas
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Cumpleaños y recaudadores del ciclo lectivo.
            </p>
          </div>

          <div>
            <label
                htmlFor="ciclo"
                className="mb-1 block text-sm font-medium"
            >
              Ciclo lectivo
            </label>

            <input
                id="ciclo"
                type="number"
                min="2000"
                max="2100"
                value={anio}
                onChange={(e) =>
                    setAnio(Number(e.target.value))
                }
                className="w-32 rounded-xl border border-gray-300 bg-white px-4 py-3"
            />
          </div>
        </div>

        {cargando && (
            <p className="text-gray-500">
              Cargando colectas...
            </p>
        )}

        {error && (
            <p
                role="alert"
                className="rounded-xl bg-red-50 p-4 text-red-700"
            >
              {error}
            </p>
        )}

        {!cargando && !error && colectas.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="font-medium">
                No hay colectas registradas para {anio}.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Cuando se generen las colectas del ciclo,
                aparecerán en esta pantalla.
              </p>
            </div>
        )}

        {!cargando && !error && colectas.length > 0 && (
            <>
              <p className="text-sm text-gray-500">
                {colectas.length} colecta(s) registradas.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {colectas.map(colecta => (
                    <div
                        key={colecta.id}
                        className="rounded-2xl border border-gray-200 bg-white p-5"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase text-gray-500">
                            Colecta #{colecta.ordenEnLaRueda}
                          </p>

                          <h2 className="mt-1 text-lg font-semibold text-tinta">
                            {colecta.beneficiarioNombre}
                          </h2>
                        </div>

                        <span className="rounded-full bg-[#FEF6BB] px-3 py-1 text-xs font-medium text-tinta">
                                        {colecta.estadoColecta.replaceAll('_', ' ')}
                                    </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                                        <span className="font-medium">
                                            Cumpleaños:
                                        </span>{' '}
                          {formatearFecha(colecta.fechaCumpleanos)}
                        </p>

                        <p>
                                        <span className="font-medium">
                                            Recaudador:
                                        </span>{' '}
                          {obtenerNombreRecaudador(
                              colecta.recaudadorId
                          )}
                        </p>

                        <p>
                                        <span className="font-medium">
                                            Monto individual:
                                        </span>{' '}
                          {formatearMonto(
                              colecta.montoIndividualPesos
                          )}
                        </p>

                        <p>
                                        <span className="font-medium">
                                            Objetivo:
                                        </span>{' '}
                          {formatearMonto(
                              colecta.montoTotalObjetivo
                          )}
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </>
        )}
      </div>
  )
}
