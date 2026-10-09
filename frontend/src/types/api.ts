/**
 * Contrato de la API REST de ColectaApp, visto desde el frontend.
 *
 * Los nombres de campo están en camelCase porque así los devuelve Spring Boot
 * (Jackson serializa los atributos Java; los @Field de Mongo no afectan al JSON).
 * Fuente: backend/src/main/java/com/colectaapp/backend/** y database/esquema_base_datos.md
 *
 * Las fechas viajan como texto ISO: "2026-10-09".
 */

// ── Módulo 1 · Autenticación y Roles ────────────────────────────────────────

/** Roles de acceso. "Recaudador" NO es un rol: se resuelve por colecta (recaudadorId). */
export type Rol = 'ADMINISTRADOR' | 'PARTICIPANTE'

/** Respuesta de GET /api/auth/me */
export interface UsuarioActual {
  id: string // mismo id que el Participante
  nombre: string
  apellido: string
  email: string
  rol: Rol
}

// ── Módulo 2 · Participantes ────────────────────────────────────────────────

/** Hijo/a embebido en el participante (Beneficiario.java). */
export interface Beneficiario {
  // Pendiente en el backend: hoy Beneficiario no tiene id. Ver lib/beneficiario.ts
  nombre: string
  fechaNacimiento: string
}

/** Participante.java — colección `padres` */
export interface Participante {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  cbuAlias: string
  activo: boolean
  hijos: Beneficiario[]
}

// ── Módulo 3 · Colectas ─────────────────────────────────────────────────────

export type EstadoColecta = 'en_recaudacion' | 'cerrada'

/** CicloLectivo.java */
export interface CicloLectivo {
  id: string
  anio: number
  activo: boolean
}

/** Colecta.java — colección `colecta_cumpleanos` (sin el array de aportes). */
export interface Colecta {
  id: string
  cicloLectivo: number
  fechaCumpleanos: string
  /** 0 mientras no se congeló el monto (Módulo 5). */
  montoIndividualPesos: number
  montoTotalObjetivo: number
  estadoColecta: EstadoColecta
  activo: boolean
  beneficiarioNombre: string
  esPrimeraVoluntaria: boolean
  /** Se fija al congelar el monto; antes rige el índice vigente (GET /api/indices/vigente). */
  indiceReferencia: IndiceId
  /** Unidades del índice por participante (ej. 5 litros). null hasta que se congela el monto. */
  cantidadUnidades: number | null
  ordenEnLaRueda: number
  /** Padre del cumpleañero */
  padreId: string
  recaudadorId: string
}

// ── Módulo 4 · Índices de Referencia ────────────────────────────────────────

export type IndiceId = 'nafta_ypf' | 'dolar_mep' | 'cajita_feliz'

/**
 * Respuesta de GET /api/indices — catálogo de índices.
 * No está en la base: lo define cada CotizacionStrategy del backend.
 */
export interface Indice {
  id: IndiceId
  nombre: string // "Nafta súper YPF"
  unidad: string // "litro"
  unidadPlural: string // "litros"
}

/** Una opción de la votación: un índice con su cantidad (ej. 5 litros de nafta). */
export interface OpcionIndice {
  indice: IndiceId
  cantidadUnidades: number
}

export type EstadoVotacion = 'abierta' | 'vigente' | 'reemplazada'

/** Respuesta de GET /api/indices/vigente — lo que se aplica hoy a las colectas sin congelar. */
export interface IndiceVigente extends OpcionIndice {
  votacionId: string
  /** Fecha en que se cerró la votación que lo eligió. */
  vigenteDesde: string
}

/** Una opción de la votación abierta, con sus votos hasta ahora. */
export interface ResultadoOpcion extends OpcionIndice {
  votos: number
}

/**
 * Respuesta de GET /api/indices/votacion — la votación abierta, vista por el usuario logueado.
 * El backend devuelve el conteo, no quién votó qué (colección `votacion_indice`).
 */
export interface VotacionAbierta {
  id: string
  cicloLectivo: number
  fechaApertura: string
  /** Nombre de quien la abrió (un ADMINISTRADOR). */
  creadaPor: string
  opciones: ResultadoOpcion[]
  /** Qué votó el usuario logueado, o null si todavía no votó. */
  miVoto: IndiceId | null
  cantidadVotaron: number
  cantidadParticipantes: number
}

/** Cuerpo de POST /api/indices/votacion (solo ADMINISTRADOR). */
export interface NuevaVotacion {
  opciones: OpcionIndice[]
}

/** Cuerpo de POST /api/indices/votacion/cerrar. `desempate` solo hace falta si hay empate. */
export interface CierreVotacion {
  desempate?: IndiceId
}

/** Respuesta de GET /api/indices/{indice}/cotizacion-actual */
export interface Cotizacion {
  indice: IndiceId
  fecha: string
  valorUnitarioArs: number
}

// ── Módulo 5 · Congelamiento de Montos ──────────────────────────────────────

/** PrecioReferencia — colección `precio_referencia` */
export interface PrecioReferencia {
  id: string
  indice: IndiceId
  fecha: string
  valorUnitarioArs: number
}

// ── Módulo 6 · Aportes y Pagos ──────────────────────────────────────────────

/** Entrada del array `aportes` embebido en cada colecta. */
export interface Aporte {
  padreId: string
  /** true: participa · false: decidió no participar · null: todavía no respondió */
  participa: boolean | null
  montoPagado: number
  fechaPago: string | null
  pagado: boolean
}

/** Cuerpo de PATCH /api/colectas/{id}/aportes/{padreId} */
export interface CambioAporte {
  participa?: boolean
  pagado?: boolean
}

/** Respuesta de GET /api/colectas/{id}/resumen — solo para el recaudador */
export interface ResumenColecta {
  colectaId: string
  recaudado: number
  montoTotalObjetivo: number
  cantidadParticipan: number
  cantidadPagaron: number
  cantidadPendientes: number
  cantidadSinResponder: number
}
