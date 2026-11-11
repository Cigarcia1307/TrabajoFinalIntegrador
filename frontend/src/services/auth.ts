
import type { UsuarioActual, Rol } from '../types/api'
import { USAR_MOCKS } from './config'
import { noEncontrado } from './errores'
import { api, guardarToken } from './http'
import { participantes, roles } from './mocks/datos'
import { idUsuarioMock } from './mocks/sesion'
import { responder } from './mocks/simular'

interface AuthResponse {
  token: string | null
  tipo: string
  email: string
  nombre: string
  rol: Rol
}

interface LoginRequest {
  email: string
  password: string
}

interface RegistroRequest {
  tokenInvitacion: string
  nombre: string
  apellido: string
  email: string
  password: string
  telefono?: string
  cbuAlias?: string
}

interface InvitacionRequest {
  email: string
}

export async function iniciarSesion(
  datos: LoginRequest,
): Promise<AuthResponse> {
  if (USAR_MOCKS) {
    throw new Error('Desactivá los mocks para iniciar sesión.')
  }

  const respuesta = await api.post<AuthResponse>(
    '/api/auth/login',
    datos,
  )

  if (!respuesta.token) {
    throw new Error('El servidor no devolvió un token JWT.')
  }

  guardarToken(respuesta.token)
  return respuesta
}

export async function registrarse(
  datos: RegistroRequest,
): Promise<AuthResponse> {
  if (USAR_MOCKS) {
    throw new Error('Desactivá los mocks para registrarte.')
  }

  const respuesta = await api.post<AuthResponse>(
    '/api/auth/registro',
    datos,
  )

  if (!respuesta.token) {
    throw new Error('El servidor no devolvió un token JWT.')
  }

  guardarToken(respuesta.token)
  return respuesta
}

export async function crearInvitacion(
  datos: InvitacionRequest,
): Promise<void> {
  if (USAR_MOCKS) {
    throw new Error('Las invitaciones requieren el backend real.')
  }

  await api.post('/api/auth/invitaciones', datos)
}

export function cerrarSesion(): void {
  guardarToken(null)
}

export async function obtenerUsuarioActual(): Promise<UsuarioActual> {
  if (!USAR_MOCKS) {
    const respuesta = await api.get<AuthResponse>('/api/auth/me')

    return {
      id: respuesta.email,
      nombre: respuesta.nombre,
      apellido: '',
      email: respuesta.email,
      rol: respuesta.rol,
    }
  }

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
