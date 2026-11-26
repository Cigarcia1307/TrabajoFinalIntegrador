
import type { Participante } from '../types/api'
import { USAR_MOCKS } from './config'
import { noEncontrado } from './errores'
import { api } from './http'
import { participantes } from './mocks/datos'
import { responder } from './mocks/simular'

export type ParticipanteRequest = {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    cbuAlias?: string
    hijos?: Participante['hijos']
}

export async function listarParticipantes(): Promise<Participante[]> {
  if (!USAR_MOCKS) return api.get('/api/participantes')
  return responder(participantes.filter((p) => p.activo))
}

export async function obtenerParticipante(id: string): Promise<Participante> {
  if (!USAR_MOCKS) return api.get(`/api/participantes/${id}`)

  const p = participantes.find((x) => x.id === id)
  if (!p) throw noEncontrado('Participante')
  return responder(p)
}

/** POST /api/participantes — crea un participante con sus hijos. */
export async function crearParticipante(
    datos: Omit<Participante, 'id'>
): Promise<Participante> {
  if (!USAR_MOCKS) {
    return api.post<Participante>('/api/participantes', datos)
  }

  const nuevoParticipante: Participante = {
    ...datos,
    id: crypto.randomUUID(),
  }

  participantes.push(nuevoParticipante)

  return responder(nuevoParticipante)
}

/** PUT /api/participantes/{id} — modifica participante. */
export async function actualizarParticipante(
    id: string,
    datos: ParticipanteRequest
): Promise<Participante> {
  if (!USAR_MOCKS) {
    return api.put<Participante>(`/api/participantes/${id}`, datos)
  }

  throw new Error('La edición de participantes requiere el backend real.')
}

/** PATCH /api/participantes/{id}/baja — baja lógica. */
export async function darDeBajaParticipante(
    id: string
): Promise<Participante> {
  if (!USAR_MOCKS) {
    return api.patch<Participante>(`/api/participantes/${id}/baja`)
  }

  throw new Error('La baja de participantes requiere el backend real.')
}

/** POST /api/participantes/{id}/beneficiarios — agrega un hijo. */
export async function agregarBeneficiario(
    id: string,
    beneficiario: { nombre: string; fechaNacimiento: string }
): Promise<Participante> {
  if (!USAR_MOCKS) {
    return api.post<Participante>(
        `/api/participantes/${id}/beneficiarios`,
        beneficiario
    )
  }

  const participante = participantes.find((p) => p.id === id)

  if (!participante) {
    throw noEncontrado('Participante')
  }

  participante.hijos.push(beneficiario)

  return responder(participante)
}

export async function solicitarCambioFechaBeneficiario(
    id: string,
    indice: number,
    fechaNacimiento: string
): Promise<Participante> {
  if (!USAR_MOCKS) {
    return api.patch<Participante>(
        `/api/participantes/${id}/beneficiarios/${indice}/solicitud-fecha`,
        { fechaNacimiento }
    )
  }

  const participante = participantes.find((p) => p.id === id)
  const beneficiario = participante?.hijos[indice]
  if (!participante || !beneficiario) throw noEncontrado('Beneficiario')
  beneficiario.fechaNacimientoSolicitada =
      beneficiario.fechaNacimiento === fechaNacimiento ? null : fechaNacimiento
  return responder(participante)
}

export async function aprobarCambioFechaBeneficiario(
    id: string,
    indice: number
): Promise<Participante> {
  if (!USAR_MOCKS) {
    return api.patch<Participante>(
        `/api/participantes/${id}/beneficiarios/${indice}/aprobar-fecha`
    )
  }

  const participante = participantes.find((p) => p.id === id)
  const beneficiario = participante?.hijos[indice]
  if (!participante || !beneficiario) throw noEncontrado('Beneficiario')
  if (!beneficiario.fechaNacimientoSolicitada) {
    throw new Error('No hay un cambio de fecha pendiente.')
  }
  beneficiario.fechaNacimiento = beneficiario.fechaNacimientoSolicitada
  beneficiario.fechaNacimientoSolicitada = null
  return responder(participante)
}

export async function rechazarCambioFechaBeneficiario(
    id: string,
    indice: number
): Promise<Participante> {
  if (!USAR_MOCKS) {
    return api.patch<Participante>(
        `/api/participantes/${id}/beneficiarios/${indice}/rechazar-fecha`
    )
  }

  const participante = participantes.find((p) => p.id === id)
  const beneficiario = participante?.hijos[indice]
  if (!participante || !beneficiario) throw noEncontrado('Beneficiario')
  beneficiario.fechaNacimientoSolicitada = null
  return responder(participante)
}
