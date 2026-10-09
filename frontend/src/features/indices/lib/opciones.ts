import { cantidadConUnidad } from '../../../lib/formato'
import type { Cotizacion, Indice, IndiceId, OpcionIndice } from '../../../types/api'

/** "5 litros de Nafta súper YPF" */
export function describirOpcion(opcion: OpcionIndice, catalogo: Indice[]): string {
  const indice = catalogo.find((i) => i.id === opcion.indice)
  if (!indice) return opcion.indice
  return `${cantidadConUnidad(opcion.cantidadUnidades, indice.unidad, indice.unidadPlural)} de ${indice.nombre}`
}

/** Cuánto sería en pesos con la cotización de hoy. */
export function pesosHoy(opcion: OpcionIndice, cotizaciones: Record<IndiceId, Cotizacion>): number {
  return opcion.cantidadUnidades * (cotizaciones[opcion.indice]?.valorUnitarioArs ?? 0)
}

export const mismaOpcion = (a: OpcionIndice, b: OpcionIndice) =>
  a.indice === b.indice && a.cantidadUnidades === b.cantidadUnidades
