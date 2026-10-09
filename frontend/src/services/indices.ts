// Módulo 4 · Índices de Referencia (Eugenia)
import type { Cotizacion, Indice, IndiceId } from '../types/api'
import { USAR_MOCKS } from './config'
import { ErrorApi, noEncontrado } from './errores'
import { api } from './http'
import { indices, preciosReferencia, votos } from './mocks/datos'
import { idUsuarioMock } from './mocks/sesion'
import { responder } from './mocks/simular'

/** GET /api/indices — los índices disponibles con sus votos. */
export async function listarIndices(): Promise<Indice[]> {
  if (!USAR_MOCKS) return api.get('/api/indices')
  return responder(indices)
}

/** El índice que ganó la votación (el más votado). */
export async function obtenerIndiceElegido(): Promise<Indice> {
  const lista = await listarIndices()
  return lista.reduce((ganador, i) => (i.votos > ganador.votos ? i : ganador))
}

/** GET /api/indices/{indice}/cotizacion-actual — la cotización más reciente. */
export async function obtenerCotizacionActual(indice: IndiceId): Promise<Cotizacion> {
  if (!USAR_MOCKS) return api.get(`/api/indices/${indice}/cotizacion-actual`)

  const ultima = preciosReferencia
    .filter((p) => p.indice === indice)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
  if (!ultima) throw noEncontrado('Cotización')
  return responder({ indice, fecha: ultima.fecha, valorUnitarioArs: ultima.valorUnitarioArs })
}

/** POST /api/indices/votar — un voto por participante. */
export async function votarIndice(indice: IndiceId): Promise<Indice[]> {
  if (!USAR_MOCKS) return api.post('/api/indices/votar', { indice })

  const usuario = idUsuarioMock()
  if (votos[usuario]) throw new ErrorApi(409, 'Ya votaste')
  const elegido = indices.find((i) => i.id === indice)
  if (!elegido) throw noEncontrado('Índice')

  votos[usuario] = indice
  elegido.votos += 1
  return responder(indices)
}

/** Si el usuario ya votó, qué índice eligió. */
export async function obtenerMiVoto(): Promise<IndiceId | null> {
  if (!USAR_MOCKS) return null // definir con el backend cómo se consulta
  return responder(votos[idUsuarioMock()] ?? null)
}
