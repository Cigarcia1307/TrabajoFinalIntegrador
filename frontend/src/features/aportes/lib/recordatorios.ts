/**
 * Recordatorios de pago (dentro del MVP, sin mails).
 *
 * Se calculan con datos que ya existen: fecha del cumple, monto congelado y el
 * estado del aporte. No hay campos ni endpoints nuevos.
 *
 * El monto se congela el día hábil anterior al cumple; el festejo y el regalo
 * suelen ser después, así que el período de pago sigue tras esa fecha y el
 * recordatorio sube de tono con los días.
 */
import { cantidadConUnidad, formatearARS, formatearFechaCorta, formatearFechaLarga } from '../../../lib/formato'
import type { Aporte, Colecta, Indice, Participante } from '../../../types/api'
import { estaCongelado } from '../../../services'

export type NivelRecordatorio = 'aviso' | 'recordatorio' | 'urgente'

/** Desde cuántos días después del cumple cada nivel. */
const DIAS_RECORDATORIO = 1
const DIAS_URGENTE = 7

const MS_POR_DIA = 24 * 60 * 60 * 1000

/** Fecha de hoy como "2026-10-11" (hora local). */
export function hoyISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Días transcurridos desde el cumple (negativo si todavía no llegó). */
export function diasDesdeCumple(fechaCumpleanos: string, hoy: string = hoyISO()): number {
  const desde = new Date(`${fechaCumpleanos}T12:00:00`).getTime()
  const hasta = new Date(`${hoy}T12:00:00`).getTime()
  return Math.round((hasta - desde) / MS_POR_DIA)
}

/** Hace falta recordar si la colecta está congelada y en curso, y el aporte no está pagado ni rechazado. */
export function necesitaRecordatorio(colecta: Colecta, aporte: Aporte | null): aporte is Aporte {
  return (
    aporte !== null &&
    colecta.estadoColecta === 'en_recaudacion' &&
    estaCongelado(colecta.montoIndividualPesos) &&
    !aporte.pagado &&
    aporte.participa !== false
  )
}

export function nivelRecordatorio(fechaCumpleanos: string, hoy: string = hoyISO()): NivelRecordatorio {
  const dias = diasDesdeCumple(fechaCumpleanos, hoy)
  if (dias >= DIAS_URGENTE) return 'urgente'
  if (dias >= DIAS_RECORDATORIO) return 'recordatorio'
  return 'aviso'
}

/** Texto del aviso que ve el participante en su tarjeta. */
export function textoAvisoParticipante(colecta: Colecta, aporte: Aporte, hoy: string = hoyISO()) {
  const nombre = colecta.beneficiarioNombre
  const monto = formatearARS(colecta.montoIndividualPesos)
  const dias = diasDesdeCumple(colecta.fechaCumpleanos, hoy)
  const nivel = nivelRecordatorio(colecta.fechaCumpleanos, hoy)

  if (aporte.participa === null) {
    return {
      nivel,
      titulo: `Ya está el monto del cumple de ${nombre}: ${monto}`,
      detalle: 'Todavía no respondiste si participás. Contale al recaudador así puede organizar el regalo.',
    }
  }
  if (nivel === 'urgente') {
    return {
      nivel,
      titulo: `Tu aporte para el cumple de ${nombre} está pendiente hace ${dias} días`,
      detalle: `Son ${monto}. Si ya transferiste, avisale al recaudador para que lo marque como pagado.`,
    }
  }
  if (nivel === 'recordatorio') {
    return {
      nivel,
      titulo: `Recordá transferir tu aporte para el cumple de ${nombre}`,
      detalle: `Son ${monto}. El festejo suele ser en estos días.`,
    }
  }
  return {
    nivel,
    titulo: `Ya está el monto del cumple de ${nombre}: ${monto}`,
    detalle: 'Se congeló el día hábil anterior al cumple. Ya podés transferir.',
  }
}

interface DatosMensaje {
  colecta: Colecta
  recaudador: Participante
  indice: Indice | null
}

function lineaMonto({ colecta, indice }: DatosMensaje): string {
  const monto = formatearARS(colecta.montoIndividualPesos)
  if (!indice || !colecta.cantidadUnidades) return `Aporte: ${monto} por familia.`
  const unidades = cantidadConUnidad(colecta.cantidadUnidades, indice.unidad, indice.unidadPlural)
  return `Aporte: ${monto} por familia (${unidades} de ${indice.nombre}).`
}

/**
 * Recordatorio para el grupo de WhatsApp. SIN NOMBRES de quienes no pagaron:
 * solo el recaudador puede saberlo (regla de visibilidad, Módulo 6).
 */
export function mensajeParaGrupo(datos: DatosMensaje): string {
  const { colecta, recaudador } = datos
  return [
    `🎁 Colecta para el cumple de ${colecta.beneficiarioNombre} (${formatearFechaLarga(colecta.fechaCumpleanos)})`,
    lineaMonto(datos),
    `Transferí al alias ${recaudador.cbuAlias} (${recaudador.nombre} ${recaudador.apellido}).`,
    'Si ya transferiste, ¡gracias! Podés ignorar este mensaje.',
  ].join('\n')
}

/** Recordatorio individual, para mandar por privado a quien todavía no pagó o no respondió. */
export function mensajeIndividual(datos: DatosMensaje, participante: Participante, aporte: Aporte): string {
  const { colecta, recaudador } = datos
  const monto = formatearARS(colecta.montoIndividualPesos)
  const cumple = `el cumple de ${colecta.beneficiarioNombre} (${formatearFechaCorta(colecta.fechaCumpleanos)})`
  if (aporte.participa === null) {
    return `¡Hola ${participante.nombre}! ¿Vas a participar del regalo para ${cumple}? El aporte es de ${monto} al alias ${recaudador.cbuAlias}. Podés responder en ColectaApp. ¡Gracias!`
  }
  return `¡Hola ${participante.nombre}! Te recuerdo el aporte para ${cumple}: ${monto} al alias ${recaudador.cbuAlias}. Si ya transferiste, avisame así lo marco. ¡Gracias!`
}
