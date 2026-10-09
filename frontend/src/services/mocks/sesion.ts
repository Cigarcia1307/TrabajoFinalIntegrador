import { IDS } from './datos'

/**
 * Usuario "logueado" en modo mocks. Cambialo para probar las distintas vistas:
 *
 *   IDS.maria   → participante común (aporte pendiente en la colecta de Martina)
 *   IDS.carlos  → recaudador de la colecta de Martina: ve el estado de todos
 *   IDS.juan    → ADMINISTRADOR
 *   IDS.laura   → madre de la cumpleañera actual: no aporta a esa colecta
 *
 * También se puede cambiar desde la consola del navegador:
 *   localStorage.setItem('colectaapp.usuarioMock', '<id>') y recargar.
 */
const USUARIO_POR_DEFECTO = IDS.maria

const CLAVE = 'colectaapp.usuarioMock'

export function idUsuarioMock(): string {
  try {
    return localStorage.getItem(CLAVE) ?? USUARIO_POR_DEFECTO
  } catch {
    return USUARIO_POR_DEFECTO
  }
}

export function cambiarUsuarioMock(id: string) {
  try {
    localStorage.setItem(CLAVE, id)
  } catch {
    // sin almacenamiento disponible: queda el usuario por defecto
  }
}
