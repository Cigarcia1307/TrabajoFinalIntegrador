/**
 * Capa de datos del frontend. Las pantallas importan SIEMPRE desde acá:
 *
 *   import { listarColectas, obtenerMiAporte } from '../../../services'
 *
 * Cada función devuelve la misma forma que el endpoint real del README.
 * Mientras USAR_MOCKS sea true (por defecto), responde con datos de prueba;
 * con el backend listo, se cambia en .env.local y las pantallas no se tocan.
 */
export * from './aportes'
export * from './auth'
export * from './colectas'
export * from './congelamiento'
export { USAR_MOCKS } from './config'
export { ErrorApi } from './errores'
export * from './indices'
export * from './participantes'
