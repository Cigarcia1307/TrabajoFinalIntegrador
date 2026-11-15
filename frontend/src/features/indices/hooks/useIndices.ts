import { useCallback, useEffect, useState } from 'react'
import {
  abrirVotacion,
  cargarCotizacion,
  cerrarVotacion,
  listarIndices,
  obtenerCotizacionActual,
  obtenerIndiceVigente,
  obtenerUsuarioActual,
  obtenerVotacionAbierta,
  votarIndice,
} from '../../../services'
import type {
  CargaCotizacion,
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
  /** null mientras la votación del ciclo no cerró. */
  vigente: IndiceVigente | null
  votacion: VotacionAbierta | null
  /** Cotización de hoy de cada índice. Falta la de un índice si no tiene precio (ej. Cajita sin cargar). */
  cotizaciones: Partial<Record<IndiceId, Cotizacion>>
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
  // Si un índice no tiene precio, la pantalla igual carga: solo falta ese valor.
  const lista = await Promise.all(catalogo.map((i) => obtenerCotizacionActual(i.id).catch(() => null)))
  const cotizaciones: Partial<Record<IndiceId, Cotizacion>> = {}
  for (const c of lista) if (c) cotizaciones[c.indice] = c
  return { usuario, esAdministrador: usuario.rol === 'ADMINISTRADOR', catalogo, vigente, votacion, cotizaciones }
}

const mensajeDe = (e: unknown) => (e instanceof Error ? e.message : 'Error inesperado')

/**
 * Pantalla del índice (Issue #5): índice del ciclo, votación abierta y,
 * para el ADMINISTRADOR, abrir y cerrar la votación del ciclo (una sola por año).
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
  const cargarPrecio = useCallback(
    (indice: IndiceId, carga: CargaCotizacion) => ejecutar(() => cargarCotizacion(indice, carga)),
    [ejecutar],
  )

  return { estado, enviando, errorAccion, votar, abrir, cerrar, cargarPrecio }
}
