// Módulo 3 · Colectas (Cintia)
import type { CicloLectivo, Colecta } from '../types/api'
import { USAR_MOCKS } from './config'
import { noEncontrado } from './errores'
import { api } from './http'
import { ciclos, colectas, type ColectaConAportes } from './mocks/datos'
import { responder } from './mocks/simular'

/** La API de colectas no expone los aportes: esos se piden aparte (Módulo 6). */
function sinAportes(colecta: ColectaConAportes): Colecta {
  const copia: Partial<ColectaConAportes> = { ...colecta }
  delete copia.aportes
  return copia as Colecta
}

/** GET /api/ciclos */
export async function listarCiclos(): Promise<CicloLectivo[]> {
  if (!USAR_MOCKS) return api.get('/api/ciclos')
  return responder(ciclos)
}

/** GET /api/colectas?ciclo=2026 — ordenadas por su lugar en la rueda. */
export async function listarColectas(ciclo: number): Promise<Colecta[]> {
  if (!USAR_MOCKS) return api.get(`/api/colectas?ciclo=${ciclo}`)
  return responder(
    colectas
      .filter((c) => c.cicloLectivo === ciclo && c.activo)
      .sort((a, b) => a.ordenEnLaRueda - b.ordenEnLaRueda)
      .map(sinAportes),
  )
}

/** GET /api/colectas/{id} */
export async function obtenerColecta(id: string): Promise<Colecta> {
  if (!USAR_MOCKS) return api.get(`/api/colectas/${id}`)
  const c = colectas.find((x) => x.id === id)
  if (!c) throw noEncontrado('Colecta')
  return responder(sinAportes(c))
}

/** GET /api/colectas/{id}/recaudador — devuelve el id del recaudador. */
export async function obtenerRecaudadorId(colectaId: string): Promise<string> {
  if (!USAR_MOCKS) return api.get(`/api/colectas/${colectaId}/recaudador`)
  const c = colectas.find((x) => x.id === colectaId)
  if (!c) throw noEncontrado('Colecta')
  return responder(c.recaudadorId)
}
