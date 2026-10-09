/**
 * Interruptor entre datos de prueba (mocks) y backend real.
 *
 * Se controla con variables de entorno de Vite, en un archivo `frontend/.env.local`
 * (no se sube a GitHub). Ver `.env.example`.
 *
 *   VITE_USAR_MOCKS=false                 → usa el backend real
 *   VITE_API_URL=http://localhost:8080    → dónde está el backend
 *
 * Si no hay .env.local, se usan los mocks.
 */
export const USAR_MOCKS = import.meta.env.VITE_USAR_MOCKS !== 'false'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
