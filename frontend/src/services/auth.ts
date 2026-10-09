// Módulo 1 · Autenticación y Roles (Pablo)
import type { UsuarioActual } from '../types/api'
import { USAR_MOCKS } from './config'
import { noEncontrado } from './errores'
import { api } from './http'
import { participantes, roles } from './mocks/datos'
import { idUsuarioMock } from './mocks/sesion'
import { responder } from './mocks/simular'

/** GET /api/auth/me — quién está logueado. */
export async function obtenerUsuarioActual(): Promise<UsuarioActual> {
  if (!USAR_MOCKS) return api.get('/api/auth/me')

  const id = idUsuarioMock()
  const p = participantes.find((x) => x.id === id)
  if (!p) throw noEncontrado('Usuario')
  return responder({
    id: p.id,
    nombre: p.nombre,
    apellido: p.apellido,
    email: p.email,
    rol: roles[p.id] ?? 'PARTICIPANTE',
  })
}

// Pendiente para el Módulo 1 (Pablo): login, registro e invitaciones.
// POST /api/auth/login · POST /api/auth/registro · POST /api/auth/invitaciones
