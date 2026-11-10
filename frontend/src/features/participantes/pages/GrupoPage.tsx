
import { useEffect, useState } from 'react'
import type { Participante } from '../../../types/api'
import { listarParticipantes } from '../../../services/participantes'
import { FormularioParticipante } from '../components/FormularioParticipante'

export function GrupoPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [seleccionado, setSeleccionado] = useState<Participante | null>(null)
  const [mostrarAlta, setMostrarAlta] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarParticipantes = async () => {
    try {
      setError('')
      const datos = await listarParticipantes()
      setParticipantes(datos)
    } catch {
      setError('No se pudieron cargar los participantes.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarParticipantes()
  }, [])

  if (seleccionado || mostrarAlta) {
    return (
        <div className="space-y-4">
          <button
              type="button"
              className="text-sm font-medium text-tinta hover:underline"
              onClick={() => {
                setSeleccionado(null)
                setMostrarAlta(false)
                void cargarParticipantes()
              }}
          >
            ← Volver al listado
          </button>

          <FormularioParticipante
              key={seleccionado?.id ?? 'nuevo'}
              participante={seleccionado ?? undefined}
          />
        </div>
    )
  }

  return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-tinta">
            Participantes
          </h2>

          <button
              type="button"
              onClick={() => setMostrarAlta(true)}
              className="rounded-xl bg-tinta px-4 py-3 font-medium text-white"
          >
            + Nuevo participante
          </button>
        </div>

        {cargando && <p>Cargando participantes...</p>}

        {error && (
            <p role="alert" className="text-red-600">
              {error}
            </p>
        )}

        {!cargando && !error && participantes.length === 0 && (
            <p>Todavía no hay participantes registrados.</p>
        )}

        {participantes.map(participante => (
            <div
                key={participante.id}
                className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-tinta">
                    {participante.nombre} {participante.apellido}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {participante.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {participante.hijos.length} hijo(s)
                  </p>
                </div>

                <button
                    type="button"
                    className="rounded-xl border border-gray-300 px-4 py-2 font-medium text-tinta hover:bg-gray-50"
                    onClick={() => setSeleccionado(participante)}
                >
                  Editar
                </button>
              </div>
            </div>
        ))}
      </div>
  )
}
