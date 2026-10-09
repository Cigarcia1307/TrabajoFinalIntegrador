// Módulo 6 · Aportes y Pagos (Eugenia)
import type { Aporte, CambioAporte, ResumenColecta } from '../types/api'
import { USAR_MOCKS } from './config'
import { ErrorApi, noEncontrado, prohibido } from './errores'
import { api } from './http'
import { colectas, type ColectaConAportes } from './mocks/datos'
import { idUsuarioMock } from './mocks/sesion'
import { responder } from './mocks/simular'

/*
 * REGLA DE VISIBILIDAD (README, "Decisiones de diseño cerradas en la 2.ª Entrega"):
 * dentro de una colecta, cada participante ve SOLO su propio aporte; el recaudador
 * de esa colecta ve el de todos y el resumen. Los mocks la aplican igual que el
 * backend, así ninguna pantalla se arma mostrando datos que la API real no va a dar.
 */

function buscarColecta(id: string): ColectaConAportes {
  const c = colectas.find((x) => x.id === id)
  if (!c) throw noEncontrado('Colecta')
  return c
}

const esRecaudador = (c: ColectaConAportes, usuarioId: string) => c.recaudadorId === usuarioId

/**
 * GET /api/colectas/{id}/aportes
 * Recaudador: todos los aportes. Participante: un array con su único aporte
 * (vacío si es el padre del cumpleañero, que no aporta a su propia colecta).
 */
export async function obtenerAportes(colectaId: string): Promise<Aporte[]> {
  if (!USAR_MOCKS) return api.get(`/api/colectas/${colectaId}/aportes`)

  const c = buscarColecta(colectaId)
  const usuario = idUsuarioMock()
  const visibles = esRecaudador(c, usuario) ? c.aportes : c.aportes.filter((a) => a.padreId === usuario)
  return responder(visibles)
}

/** Atajo: el aporte del usuario logueado, o null si no aporta a esta colecta. */
export async function obtenerMiAporte(colectaId: string, usuarioId: string): Promise<Aporte | null> {
  const aportes = await obtenerAportes(colectaId)
  return aportes.find((a) => a.padreId === usuarioId) ?? null
}

/**
 * PATCH /api/colectas/{id}/aportes/{padreId}
 * - `participa`: lo decide cada uno sobre sí mismo (o el recaudador).
 * - `pagado`: solo lo marca el recaudador, cuando recibe la transferencia.
 */
export async function actualizarAporte(
  colectaId: string,
  padreId: string,
  cambio: CambioAporte,
): Promise<Aporte> {
  if (!USAR_MOCKS) return api.patch(`/api/colectas/${colectaId}/aportes/${padreId}`, cambio)

  const c = buscarColecta(colectaId)
  const usuario = idUsuarioMock()
  const recaudador = esRecaudador(c, usuario)

  if (!recaudador && padreId !== usuario) throw prohibido('Solo podés modificar tu propio aporte')
  if (cambio.pagado !== undefined && !recaudador) throw prohibido('Solo el recaudador registra pagos')
  if (c.estadoColecta === 'cerrada') throw prohibido('La colecta ya está cerrada')
  if (cambio.pagado === true && c.montoIndividualPesos <= 0)
    throw new ErrorApi(409, 'El monto todavía no está congelado: no se pueden registrar pagos')

  const aporte = c.aportes.find((a) => a.padreId === padreId)
  if (!aporte) throw noEncontrado('Aporte')

  if (cambio.participa !== undefined) {
    aporte.participa = cambio.participa
    if (!cambio.participa) Object.assign(aporte, { pagado: false, montoPagado: 0, fechaPago: null })
  }
  if (cambio.pagado !== undefined) {
    aporte.pagado = cambio.pagado
    aporte.participa = cambio.pagado ? true : aporte.participa
    aporte.montoPagado = cambio.pagado ? c.montoIndividualPesos : 0
    aporte.fechaPago = cambio.pagado ? new Date().toISOString().slice(0, 10) : null
  }
  return responder(aporte)
}

/** GET /api/colectas/{id}/resumen — solo el recaudador. */
export async function obtenerResumen(colectaId: string): Promise<ResumenColecta> {
  if (!USAR_MOCKS) return api.get(`/api/colectas/${colectaId}/resumen`)

  const c = buscarColecta(colectaId)
  if (!esRecaudador(c, idUsuarioMock())) throw prohibido('Solo el recaudador ve el resumen')

  const participan = c.aportes.filter((a) => a.participa === true)
  return responder({
    colectaId: c.id,
    recaudado: c.aportes.reduce((total, a) => total + a.montoPagado, 0),
    montoTotalObjetivo: c.montoTotalObjetivo,
    cantidadParticipan: participan.length,
    cantidadPagaron: participan.filter((a) => a.pagado).length,
    cantidadPendientes: participan.filter((a) => !a.pagado).length,
    cantidadSinResponder: c.aportes.filter((a) => a.participa === null).length,
  })
}

/** GET /api/colectas/{id}/deuda-pendiente — solo el recaudador: quiénes participan y no pagaron. */
export async function obtenerDeudaPendiente(colectaId: string): Promise<Aporte[]> {
  if (!USAR_MOCKS) return api.get(`/api/colectas/${colectaId}/deuda-pendiente`)

  const c = buscarColecta(colectaId)
  if (!esRecaudador(c, idUsuarioMock())) throw prohibido('Solo el recaudador ve la deuda pendiente')
  return responder(c.aportes.filter((a) => a.participa === true && !a.pagado))
}
