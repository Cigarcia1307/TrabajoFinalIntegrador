
import type { Colecta, PrecioReferencia } from '../types/api'
import { api } from './http'

/**
 * GET /api/precios-referencia
 * Devuelve todos los precios de referencia ordenados por fecha.
 */
export async function listarPreciosReferencia(): Promise<PrecioReferencia[]> {
  return api.get<PrecioReferencia[]>('/api/precios-referencia')
}

/**
 * POST /api/precios-referencia/congelar/{colectaId}
 * Congela el monto individual de una colecta.
 */
export async function congelarMonto(colectaId: string): Promise<Colecta> {
  if (!colectaId.trim()) {
    throw new Error('El ID de la colecta es obligatorio')
  }

  return api.post<Colecta>(
    `/api/precios-referencia/congelar/${encodeURIComponent(colectaId)}`
  )
}

/**
 * Una colecta tiene el monto congelado cuando
 * ya tiene un valor positivo en pesos.
 */
export const estaCongelado = (montoIndividualPesos: number): boolean =>
  montoIndividualPesos > 0
