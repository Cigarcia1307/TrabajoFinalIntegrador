import { useCallback, useEffect, useState } from 'react'
import {
  ErrorApi,
  actualizarAporte,
  estaCongelado,
  listarParticipantes,
  obtenerAportes,
  obtenerColecta,
  obtenerResumen,
} from '../../../services'
import type { Aporte, Colecta, Participante, ResumenColecta } from '../../../types/api'

export interface FilaAporte {
  aporte: Aporte
  participante: Participante | undefined
}

export interface DatosRecaudacion {
  colecta: Colecta
  resumen: ResumenColecta
  filas: FilaAporte[]
  congelado: boolean
}

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; datos: DatosRecaudacion }

/** Orden de la lista: primero lo que requiere acción del recaudador. */
function prioridad(a: Aporte): number {
  if (a.participa === true && !a.pagado) return 0 // pendiente de pago
  if (a.participa === null) return 1 // sin responder
  if (a.pagado) return 2 // pagado
  return 3 // no participa
}

async function cargar(colectaId: string): Promise<DatosRecaudacion> {
  const [colecta, aportes, resumen, participantes] = await Promise.all([
    obtenerColecta(colectaId),
    obtenerAportes(colectaId),
    obtenerResumen(colectaId),
    listarParticipantes(),
  ])
  const filas = aportes
    .map((aporte) => ({ aporte, participante: participantes.find((p) => p.id === aporte.padreId) }))
    .sort((x, y) => prioridad(x.aporte) - prioridad(y.aporte))
  return { colecta, resumen, filas, congelado: estaCongelado(colecta.montoIndividualPesos) }
}

/**
 * Vista del recaudador de UNA colecta: estado de todos y resumen.
 * El backend (y los mocks) devuelven 403 si el usuario no es el recaudador.
 */
export function useRecaudacion(colectaId: string) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  const [version, setVersion] = useState(0)
  const [guardandoId, setGuardandoId] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    cargar(colectaId)
      .then((datos) => vigente && setEstado({ tipo: 'listo', datos }))
      .catch((e: unknown) => {
        if (!vigente) return
        const mensaje =
          e instanceof ErrorApi && e.status === 403
            ? 'Solo el recaudador de esta colecta puede ver este panel.'
            : e instanceof Error
              ? e.message
              : 'Error inesperado'
        setEstado({ tipo: 'error', mensaje })
      })
    return () => {
      vigente = false
    }
  }, [colectaId, version])

  /** Registra (o deshace) el pago de un participante. */
  const marcarPago = useCallback(
    async (padreId: string, pagado: boolean) => {
      setGuardandoId(padreId)
      setErrorAccion(null)
      try {
        await actualizarAporte(colectaId, padreId, { pagado })
        setVersion((v) => v + 1)
      } catch (e) {
        setErrorAccion(e instanceof Error ? e.message : 'No se pudo registrar el pago')
      } finally {
        setGuardandoId(null)
      }
    },
    [colectaId],
  )

  return { estado, guardandoId, errorAccion, marcarPago }
}
