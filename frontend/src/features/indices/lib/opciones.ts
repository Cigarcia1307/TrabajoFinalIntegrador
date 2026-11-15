import { cantidadConUnidad, formatearARS } from '../../../lib/formato'
import type { Cotizacion, Indice, IndiceId, OpcionIndice } from '../../../types/api'

/** "5 litros de Nafta súper YPF" */
export function describirOpcion(opcion: OpcionIndice, catalogo: Indice[]): string {
  const indice = catalogo.find((i) => i.id === opcion.indice)
  if (!indice) return opcion.indice
  return `${cantidadConUnidad(opcion.cantidadUnidades, indice.unidad, indice.unidadPlural)} de ${indice.nombre}`
}

/** Cuánto sería en pesos con la cotización de hoy, o null si ese índice no tiene precio. */
export function pesosHoy(opcion: OpcionIndice, cotizaciones: Partial<Record<IndiceId, Cotizacion>>): number | null {
  const cotizacion = cotizaciones[opcion.indice]
  return cotizacion ? opcion.cantidadUnidades * cotizacion.valorUnitarioArs : null
}

/** "≈ $ 7.450 por persona hoy", o aviso si no hay precio. */
export function textoPesosHoy(opcion: OpcionIndice, cotizaciones: Partial<Record<IndiceId, Cotizacion>>): string {
  const pesos = pesosHoy(opcion, cotizaciones)
  return pesos === null ? 'Todavía no tiene precio cargado' : `≈ ${formatearARS(pesos)} por persona hoy`
}
