// Módulo 5 · Congelamiento de Montos (Pablo)
import type { IndiceId, PrecioReferencia } from '../types/api'
import { USAR_MOCKS } from './config'
import { noEncontrado } from './errores'
import { api } from './http'
import { preciosReferencia } from './mocks/datos'
import { responder } from './mocks/simular'

/** GET /api/precios-referencia?indice=nafta_ypf&fecha=2026-10-08 */
export async function obtenerPrecioReferencia(indice: IndiceId, fecha: string): Promise<PrecioReferencia> {
  if (!USAR_MOCKS) return api.get(`/api/precios-referencia?indice=${indice}&fecha=${fecha}`)

  const precio = preciosReferencia.find((p) => p.indice === indice && p.fecha === fecha)
  if (!precio) throw noEncontrado('Precio de referencia')
  return responder(precio)
}

/** Una colecta tiene su monto congelado cuando ya tiene un valor en pesos. */
export const estaCongelado = (montoIndividualPesos: number) => montoIndividualPesos > 0
