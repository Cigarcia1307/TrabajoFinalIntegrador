
import { API_URL } from './config'
import { ErrorApi } from './errores'

const CLAVE_TOKEN = 'colectaapp.token'

export function guardarToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(CLAVE_TOKEN, token)
    } else {
      localStorage.removeItem(CLAVE_TOKEN)
    }
  } catch {
    // Almacenamiento no disponible.
  }
}

export function obtenerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

async function pedir<T>(
  metodo: string,
  ruta: string,
  cuerpo?: unknown,
): Promise<T> {
  const token = obtenerToken()

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  })

  if (respuesta.status === 401 && ruta !== '/api/auth/login') {
    guardarToken(null)
    window.location.href = '/login'
    throw new ErrorApi(401, 'Sesión expirada. Iniciá sesión nuevamente.')
  }

  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => '')
    throw new ErrorApi(
      respuesta.status,
      texto || respuesta.statusText,
    )
  }

  if (respuesta.status === 204) {
    return undefined as T
  }

  const tipo = respuesta.headers.get('content-type') ?? ''

  return (
    tipo.includes('application/json')
      ? respuesta.json()
      : respuesta.text()
  ) as Promise<T>
}

export const api = {
  get: <T>(ruta: string) => pedir<T>('GET', ruta),
  post: <T>(ruta: string, cuerpo?: unknown) =>
    pedir<T>('POST', ruta, cuerpo),
  put: <T>(ruta: string, cuerpo?: unknown) =>
    pedir<T>('PUT', ruta, cuerpo),
  patch: <T>(ruta: string, cuerpo?: unknown) =>
    pedir<T>('PATCH', ruta, cuerpo),
}
