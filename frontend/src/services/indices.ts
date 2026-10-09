// Módulo 4 · Índices de Referencia (Eugenia)
import type {
  CierreVotacion,
  Cotizacion,
  Indice,
  IndiceId,
  IndiceVigente,
  NuevaVotacion,
  VotacionAbierta,
} from '../types/api'
import { USAR_MOCKS } from './config'
import { ErrorApi, noEncontrado, prohibido } from './errores'
import { api } from './http'
import { indices, participantes, preciosReferencia, roles, votaciones, type VotacionMock } from './mocks/datos'
import { idUsuarioMock } from './mocks/sesion'
import { responder } from './mocks/simular'

/** GET /api/indices — catálogo de índices (nombre y unidad). */
export async function listarIndices(): Promise<Indice[]> {
  if (!USAR_MOCKS) return api.get('/api/indices')
  return responder(indices)
}

/** GET /api/indices/vigente — índice y cantidad que se aplican hoy a las colectas sin congelar. */
export async function obtenerIndiceVigente(): Promise<IndiceVigente> {
  if (!USAR_MOCKS) return api.get('/api/indices/vigente')

  const v = votaciones.find((x) => x.estado === 'vigente')
  if (!v || !v.indiceElegido || v.cantidadUnidades === null) throw noEncontrado('Índice vigente')
  return responder({
    votacionId: v.id,
    indice: v.indiceElegido,
    cantidadUnidades: v.cantidadUnidades,
    vigenteDesde: v.fechaCierre ?? v.fechaApertura,
  })
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

/** GET /api/indices/votacion — la votación abierta, o null si no hay ninguna (el backend responde 204). */
export async function obtenerVotacionAbierta(): Promise<VotacionAbierta | null> {
  if (!USAR_MOCKS) return api.get('/api/indices/votacion')

  const v = votacionAbiertaMock()
  return responder(v ? vistaDe(v) : null)
}

/** POST /api/indices/votar — un voto por participante y por votación. */
export async function votarIndice(indice: IndiceId): Promise<VotacionAbierta> {
  if (!USAR_MOCKS) return api.post('/api/indices/votar', { indice })

  const v = votacionAbiertaMock()
  if (!v) throw new ErrorApi(409, 'No hay ninguna votación abierta')
  const usuario = idUsuarioMock()
  if (v.votos.some((x) => x.padreId === usuario)) throw new ErrorApi(409, 'Ya votaste en esta votación')
  if (!v.opciones.some((o) => o.indice === indice)) throw noEncontrado('Opción')

  v.votos.push({ padreId: usuario, indice, fecha: hoy() })
  return responder(vistaDe(v))
}

/** POST /api/indices/votacion — solo ADMINISTRADOR. Abre una votación nueva para cambiar índice o cantidad. */
export async function abrirVotacion(nueva: NuevaVotacion): Promise<VotacionAbierta> {
  if (!USAR_MOCKS) return api.post('/api/indices/votacion', nueva)

  exigirAdministrador()
  if (votacionAbiertaMock()) throw new ErrorApi(409, 'Ya hay una votación abierta')
  const indicesDistintos = new Set(nueva.opciones.map((o) => o.indice))
  if (nueva.opciones.length < 2 || indicesDistintos.size !== nueva.opciones.length) {
    throw new ErrorApi(400, 'La votación necesita al menos 2 opciones, con índices distintos')
  }
  if (nueva.opciones.some((o) => !Number.isFinite(o.cantidadUnidades) || o.cantidadUnidades <= 0)) {
    throw new ErrorApi(400, 'Cada opción necesita una cantidad mayor a 0')
  }

  const v: VotacionMock = {
    id: `votacion-${Date.now()}`,
    cicloLectivo: 2026,
    estado: 'abierta',
    creadaPor: idUsuarioMock(),
    fechaApertura: hoy(),
    fechaCierre: null,
    opciones: nueva.opciones.map((o) => ({ ...o })),
    votos: [],
    indiceElegido: null,
    cantidadUnidades: null,
  }
  votaciones.push(v)
  return responder(vistaDe(v))
}

/**
 * POST /api/indices/votacion/cerrar — solo ADMINISTRADOR.
 * La más votada pasa a vigente y la anterior a reemplazada. Si hay empate, el admin
 * tiene que mandar `desempate` con una de las opciones empatadas (si no, 409).
 */
export async function cerrarVotacion(cierre: CierreVotacion = {}): Promise<IndiceVigente> {
  if (!USAR_MOCKS) return api.post('/api/indices/votacion/cerrar', cierre)

  exigirAdministrador()
  const v = votacionAbiertaMock()
  if (!v) throw new ErrorApi(409, 'No hay ninguna votación abierta')

  const empatadas = opcionesMasVotadas(vistaDe(v).opciones)
  let ganadora = empatadas[0]
  if (empatadas.length > 1) {
    ganadora = empatadas.find((o) => o.indice === cierre.desempate)!
    if (!ganadora) throw new ErrorApi(409, 'Hay empate: elegí cuál de las opciones empatadas gana')
  }

  const anterior = votaciones.find((x) => x.estado === 'vigente')
  if (anterior) anterior.estado = 'reemplazada'
  v.estado = 'vigente'
  v.fechaCierre = hoy()
  v.indiceElegido = ganadora.indice
  v.cantidadUnidades = ganadora.cantidadUnidades
  return obtenerIndiceVigente()
}

/** Las opciones con más votos (más de una si hay empate). */
export function opcionesMasVotadas<T extends { votos: number }>(opciones: T[]): T[] {
  const max = Math.max(...opciones.map((o) => o.votos))
  return opciones.filter((o) => o.votos === max)
}

// ── Ayudas internas de los mocks ────────────────────────────────────────────

const hoy = () => new Date().toISOString().slice(0, 10)

const votacionAbiertaMock = () => votaciones.find((x) => x.estado === 'abierta')

function exigirAdministrador() {
  if (roles[idUsuarioMock()] !== 'ADMINISTRADOR') {
    throw prohibido('Solo un administrador puede abrir o cerrar votaciones')
  }
}

/** Lo que el backend le devuelve al usuario: conteos y su propio voto, no quién votó qué. */
function vistaDe(v: VotacionMock): VotacionAbierta {
  const usuario = idUsuarioMock()
  const creador = participantes.find((p) => p.id === v.creadaPor)
  return {
    id: v.id,
    cicloLectivo: v.cicloLectivo,
    fechaApertura: v.fechaApertura,
    creadaPor: creador ? `${creador.nombre} ${creador.apellido}` : 'Administración',
    opciones: v.opciones.map((o) => ({ ...o, votos: v.votos.filter((x) => x.indice === o.indice).length })),
    miVoto: v.votos.find((x) => x.padreId === usuario)?.indice ?? null,
    cantidadVotaron: v.votos.length,
    cantidadParticipantes: participantes.filter((p) => p.activo).length,
  }
}
