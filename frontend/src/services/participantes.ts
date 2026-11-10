// Módulo 2 · Participantes (Cintia)
import type { Participante } from '../types/api'
import { USAR_MOCKS } from './config'
import { noEncontrado } from './errores'
import { api } from './http'
import { participantes } from './mocks/datos'
import { responder } from './mocks/simular'

/** GET /api/participantes — solo los activos (igual que el backend). */
export async function listarParticipantes(): Promise<Participante[]> {
  if (!USAR_MOCKS) return api.get('/api/participantes')
  return responder(participantes.filter((p) => p.activo))
}

/** GET /api/participantes/{id} */
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
    id: crypto.randomUUID()
  }

  participantes.push(nuevoParticipante)

  return responder(nuevoParticipante)
}


/** PUT /api/participantes/{id} — modifica participante e hijos. */
export async function actualizarParticipante(
    id: string,
    datos: Omit<Participante, 'id'>
): Promise<Participante> {
  if (!USAR_MOCKS) {
    return api.put<Participante>(`/api/participantes/${id}`, datos)
  }

  const indice = participantes.findIndex((p) => p.id === id)

  if (indice === -1) {
    throw noEncontrado('Participante')
  }

  participantes[indice] = { ...datos, id }

  return responder(participantes[indice])
}

