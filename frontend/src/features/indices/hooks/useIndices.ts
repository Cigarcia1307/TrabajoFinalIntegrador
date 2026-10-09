import { useCallback, useEffect, useState } from 'react'
import {
  abrirVotacion,
  cerrarVotacion,
  listarIndices,
  obtenerCotizacionActual,
  obtenerIndiceVigente,
  obtenerUsuarioActual,
  obtenerVotacionAbierta,
  votarIndice,
} from '../../../services'
import type {
  Cotizacion,
  Indice,
  IndiceId,
  IndiceVigente,
  OpcionIndice,
  UsuarioActual,
  VotacionAbierta,
} from '../../../types/api'

export interface DatosIndices {
  usuario: UsuarioActual
  esAdministrador: boolean
  catalogo: Indice[]
  vigente: IndiceVigente
  votacion: VotacionAbierta | null
  /** Cotización de hoy de cada índice, para mostrar cuánto serían en pesos. */
  cotizaciones: Record<IndiceId, Cotizacion>
}

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; datos: DatosIndices }

async function cargar(): Promise<DatosIndices> {
  const [usuario, catalogo, vigente, votacion] = await Promise.all([
    obtenerUsuarioActual(),
    listarIndices(),
    obtenerIndiceVigente(),
    obtenerVotacionAbierta(),
  ])
  const lista = await Promise.all(catalogo.map((i) => obtenerCotizacionActual(i.id)))
  const cotizaciones = Object.fromEntries(lista.map((c) => [c.indice, c])) as Record<IndiceId, Cotizacion>
  return { usuario, esAdministrador: usuario.rol === 'ADMINISTRADOR', catalogo, vigente, votacion, cotizaciones }
}

const mensajeDe = (e: unknown) => (e instanceof Error ? e.message : 'Error inesperado')

/**
 * Pantalla del índice (Issue #5): índice vigente, votación abierta y,
 * para el ADMINISTRADOR, abrir y cerrar votaciones.
 */
export function useIndices() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  const [version, setVersion] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    cargar()
      .then((datos) => vigente && setEstado({ tipo: 'listo', datos }))
      .catch((e: unknown) => vigente && setEstado({ tipo: 'error', mensaje: mensajeDe(e) }))
    return () => {
      vigente = false
    }
  }, [version])

  /** Ejecuta una acción, muestra su error si falla y recarga los datos si sale bien. */
  const ejecutar = useCallback(async (accion: () => Promise<unknown>): Promise<boolean> => {
    setEnviando(true)
    setErrorAccion(null)
    try {
      await accion()
      setVersion((v) => v + 1)
      return true
    } catch (e) {
      setErrorAccion(mensajeDe(e))
      return false
    } finally {
      setEnviando(false)
    }
  }, [])

  const votar = useCallback((indice: IndiceId) => ejecutar(() => votarIndice(indice)), [ejecutar])
  const abrir = useCallback((opciones: OpcionIndice[]) => ejecutar(() => abrirVotacion({ opciones })), [ejecutar])
  const cerrar = useCallback((desempate?: IndiceId) => ejecutar(() => cerrarVotacion({ desempate })), [ejecutar])

  return { estado, enviando, errorAccion, votar, abrir, cerrar }
}
