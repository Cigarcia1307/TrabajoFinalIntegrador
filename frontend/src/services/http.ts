import { API_URL } from './config'
import { ErrorApi } from './errores'

/**
 * Cliente HTTP para el backend real. Agrega el token JWT si hay sesión.
 * Lo usan los servicios cuando USAR_MOCKS es false.
 */

const CLAVE_TOKEN = 'colectaapp.token'

export function guardarToken(token: string | null) {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token)
    else localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // Navegación privada o almacenamiento bloqueado: la sesión dura lo que la pestaña.
  }
}

function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

async function pedir<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  const token = leerToken()
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  })

  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => '')
    throw new ErrorApi(respuesta.status, texto || respuesta.statusText)
  }
  if (respuesta.status === 204) return undefined as T

  const tipo = respuesta.headers.get('content-type') ?? ''
  return (tipo.includes('application/json') ? respuesta.json() : respuesta.text()) as Promise<T>
}

export const api = {
  get: <T>(ruta: string) => pedir<T>('GET', ruta),
  post: <T>(ruta: string, cuerpo?: unknown) => pedir<T>('POST', ruta, cuerpo),
  put: <T>(ruta: string, cuerpo?: unknown) => pedir<T>('PUT', ruta, cuerpo),
  patch: <T>(ruta: string, cuerpo?: unknown) => pedir<T>('PATCH', ruta, cuerpo),
}
