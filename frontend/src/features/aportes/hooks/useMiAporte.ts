import { useCallback, useEffect, useState } from 'react'
import {
  actualizarAporte,
  estaCongelado,
  listarIndices,
  obtenerColecta,
  obtenerCotizacionActual,
  obtenerMiAporte,
  obtenerParticipante,
  obtenerUsuarioActual,
} from '../../../services'
import type { Aporte, Colecta, Indice, Participante, UsuarioActual } from '../../../types/api'

export interface DatosMiAporte {
  usuario: UsuarioActual
  colecta: Colecta
  /** null si el usuario es el padre del cumpleañero (no aporta a su propia colecta). */
  aporte: Aporte | null
  indice: Indice
  recaudador: Participante
  /** Monto a mostrar: el congelado, o una estimación con la cotización de hoy. */
  monto: number
  congelado: boolean
  /** Fecha de la cotización usada para estimar (solo si no está congelado). */
  fechaEstimacion: string | null
}

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; datos: DatosMiAporte }

async function cargar(colectaId: string): Promise<DatosMiAporte> {
  const [usuario, colecta, indices] = await Promise.all([
    obtenerUsuarioActual(),
    obtenerColecta(colectaId),
    listarIndices(),
  ])
  const indice = indices.find((i) => i.id === colecta.indiceReferencia)
  if (!indice) throw new Error('No se encontró el índice de referencia de la colecta')

  const [aporte, recaudador] = await Promise.all([
    obtenerMiAporte(colectaId, usuario.id),
    obtenerParticipante(colecta.recaudadorId),
  ])

  const congelado = estaCongelado(colecta.montoIndividualPesos)
  if (congelado) {
    return { usuario, colecta, aporte, indice, recaudador, monto: colecta.montoIndividualPesos, congelado, fechaEstimacion: null }
  }

  const cotizacion = await obtenerCotizacionActual(indice.id)
  return {
    usuario,
    colecta,
    aporte,
    indice,
    recaudador,
    monto: indice.cantidadPorParticipante * cotizacion.valorUnitarioArs,
    congelado,
    fechaEstimacion: cotizacion.fecha,
  }
}

/**
 * Todo lo que necesita la vista del participante para una colecta:
 * su aporte, el monto (congelado o estimado) y a quién transferirle.
 */
export function useMiAporte(colectaId: string) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  const [version, setVersion] = useState(0)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let vigente = true
    cargar(colectaId)
      .then((datos) => vigente && setEstado({ tipo: 'listo', datos }))
      .catch((e: unknown) =>
        vigente && setEstado({ tipo: 'error', mensaje: e instanceof Error ? e.message : 'Error inesperado' }),
      )
    return () => {
      vigente = false
    }
  }, [colectaId, version])

  /** El participante decide si participa o no en esta colecta. */
  const responder = useCallback(
    async (participa: boolean) => {
      if (estado.tipo !== 'listo') return
      setGuardando(true)
      try {
        await actualizarAporte(colectaId, estado.datos.usuario.id, { participa })
        setVersion((v) => v + 1)
      } finally {
        setGuardando(false)
      }
    },
    [colectaId, estado],
  )

  return { estado, guardando, responder }
}
