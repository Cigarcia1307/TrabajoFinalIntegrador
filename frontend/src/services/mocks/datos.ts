import type {
  Aporte,
  CicloLectivo,
  Colecta,
  Indice,
  IndiceId,
  Participante,
  PrecioReferencia,
  Rol,
} from '../../types/api'

/**
 * Datos de prueba: un grupo de 3.º grado, ciclo 2026, con 6 familias.
 * Los 3 primeros padres son los de database/*.json (mismos ids).
 *
 * Estado de la rueda al 8/10/2026:
 *   1. Tomás     20/03  cerrada
 *   2. Sofía     30/06  cerrada
 *   3. Valentina 15/09  cerrada
 *   4. Martina   09/10  en recaudación · monto CONGELADO   ← colecta actual
 *   5. Benjamín  05/11  en recaudación · monto estimado (sin congelar)
 *   6. Camila    27/11  en recaudación · monto estimado (sin congelar)
 *
 * Recaudador: la 1.ª la organiza una voluntaria (María); desde la 2.ª, el padre
 * del cumpleañero anterior. El padre del cumpleañero no aporta a su colecta.
 *
 * Los datos se pueden modificar durante la sesión (marcar pagos, votar); al
 * recargar la página vuelven a este estado inicial.
 */

export const IDS = {
  juan: '6a9dec18b9068acfd506196b',
  maria: '6a9dfd0ab9068acfd5061971',
  carlos: '6a9dfd4ab9068acfd5061973',
  laura: '6a9e10aab9068acfd5061975',
  diego: '6a9e10bbb9068acfd5061977',
  ana: '6a9e10ccb9068acfd5061979',
} as const

/** Rol de acceso de cada participante (Módulo 1). */
export const roles: Record<string, Rol> = {
  [IDS.juan]: 'ADMINISTRADOR',
}

export const participantes: Participante[] = [
  {
    id: IDS.juan,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@gmail.com',
    telefono: '3511234567',
    cbuAlias: 'juan.perez.mp',
    activo: true,
    hijos: [{ nombre: 'Tomás', fechaNacimiento: '2015-03-20' }],
  },
  {
    id: IDS.maria,
    nombre: 'María',
    apellido: 'Gómez',
    email: 'maria.gomez@gmail.com',
    telefono: '3512345678',
    cbuAlias: 'maria.gomez.mp',
    activo: true,
    hijos: [{ nombre: 'Sofía', fechaNacimiento: '2015-06-30' }],
  },
  {
    id: IDS.carlos,
    nombre: 'Carlos',
    apellido: 'Fernández',
    email: 'carlos.fernandez@gmail.com',
    telefono: '3513456789',
    cbuAlias: 'carlos.fernandez.mp',
    activo: true,
    hijos: [{ nombre: 'Valentina', fechaNacimiento: '2015-09-15' }],
  },
  {
    id: IDS.laura,
    nombre: 'Laura',
    apellido: 'Paz',
    email: 'laura.paz@gmail.com',
    telefono: '3514567890',
    cbuAlias: 'laura.paz.mp',
    activo: true,
    hijos: [{ nombre: 'Martina', fechaNacimiento: '2015-10-09' }],
  },
  {
    id: IDS.diego,
    nombre: 'Diego',
    apellido: 'Ríos',
    email: 'diego.rios@gmail.com',
    telefono: '3515678901',
    cbuAlias: 'diego.rios.mp',
    activo: true,
    hijos: [{ nombre: 'Benjamín', fechaNacimiento: '2015-11-05' }],
  },
  {
    id: IDS.ana,
    nombre: 'Ana',
    apellido: 'Suárez',
    email: 'ana.suarez@gmail.com',
    telefono: '3516789012',
    cbuAlias: 'ana.suarez.mp',
    activo: true,
    hijos: [{ nombre: 'Camila', fechaNacimiento: '2015-11-27' }],
  },
]

export const ciclos: CicloLectivo[] = [{ id: 'ciclo-2026', anio: 2026, activo: true }]

/** Colecta tal como está en la base: con su array de aportes embebido. */
export interface ColectaConAportes extends Colecta {
  aportes: Aporte[]
}

/** Arma los aportes de una colecta: todos los padres activos menos el del cumpleañero. */
function aportesIniciales(
  padreCumpleanero: string,
  estados: Partial<Record<string, Partial<Aporte>>> = {},
): Aporte[] {
  return participantes
    .filter((p) => p.activo && p.id !== padreCumpleanero)
    .map((p) => ({
      padreId: p.id,
      participa: null,
      montoPagado: 0,
      fechaPago: null,
      pagado: false,
      ...estados[p.id],
    }))
}

const pago = (monto: number, fecha: string): Partial<Aporte> => ({
  participa: true,
  pagado: true,
  montoPagado: monto,
  fechaPago: fecha,
})

const todosPagaron = (padreCumpleanero: string, monto: number, fecha: string) =>
  Object.fromEntries(
    participantes.filter((p) => p.id !== padreCumpleanero).map((p) => [p.id, pago(monto, fecha)]),
  )

export const colectas: ColectaConAportes[] = [
  {
    id: 'colecta-1-tomas',
    cicloLectivo: 2026,
    fechaCumpleanos: '2026-03-20',
    montoIndividualPesos: 5600,
    montoTotalObjetivo: 28000,
    estadoColecta: 'cerrada',
    activo: true,
    beneficiarioNombre: 'Tomás',
    esPrimeraVoluntaria: true,
    indiceReferencia: 'nafta_ypf',
    ordenEnLaRueda: 1,
    padreId: IDS.juan,
    recaudadorId: IDS.maria,
    aportes: aportesIniciales(IDS.juan, todosPagaron(IDS.juan, 5600, '2026-03-18')),
  },
  {
    id: 'colecta-2-sofia',
    cicloLectivo: 2026,
    fechaCumpleanos: '2026-06-30',
    montoIndividualPesos: 6250,
    montoTotalObjetivo: 31250,
    estadoColecta: 'cerrada',
    activo: true,
    beneficiarioNombre: 'Sofía',
    esPrimeraVoluntaria: false,
    indiceReferencia: 'nafta_ypf',
    ordenEnLaRueda: 2,
    padreId: IDS.maria,
    recaudadorId: IDS.juan,
    aportes: aportesIniciales(IDS.maria, {
      ...todosPagaron(IDS.maria, 6250, '2026-06-28'),
      [IDS.ana]: { participa: false },
    }),
  },
  {
    id: 'colecta-3-valentina',
    cicloLectivo: 2026,
    fechaCumpleanos: '2026-09-15',
    montoIndividualPesos: 7100,
    montoTotalObjetivo: 35500,
    estadoColecta: 'cerrada',
    activo: true,
    beneficiarioNombre: 'Valentina',
    esPrimeraVoluntaria: false,
    indiceReferencia: 'nafta_ypf',
    ordenEnLaRueda: 3,
    padreId: IDS.carlos,
    recaudadorId: IDS.maria,
    aportes: aportesIniciales(IDS.carlos, todosPagaron(IDS.carlos, 7100, '2026-09-12')),
  },
  {
    id: 'colecta-4-martina',
    cicloLectivo: 2026,
    fechaCumpleanos: '2026-10-09',
    montoIndividualPesos: 7450, // congelado el 08/10: 5 litros × $1.490
    montoTotalObjetivo: 37250,
    estadoColecta: 'en_recaudacion',
    activo: true,
    beneficiarioNombre: 'Martina',
    esPrimeraVoluntaria: false,
    indiceReferencia: 'nafta_ypf',
    ordenEnLaRueda: 4,
    padreId: IDS.laura,
    recaudadorId: IDS.carlos,
    aportes: aportesIniciales(IDS.laura, {
      [IDS.juan]: pago(7450, '2026-10-08'),
      [IDS.carlos]: pago(7450, '2026-10-08'),
      [IDS.maria]: { participa: true },
      [IDS.diego]: { participa: false },
      // Ana: todavía no respondió (participa: null)
    }),
  },
  {
    id: 'colecta-5-benjamin',
    cicloLectivo: 2026,
    fechaCumpleanos: '2026-11-05',
    montoIndividualPesos: 0, // se congela el día hábil anterior
    montoTotalObjetivo: 0,
    estadoColecta: 'en_recaudacion',
    activo: true,
    beneficiarioNombre: 'Benjamín',
    esPrimeraVoluntaria: false,
    indiceReferencia: 'nafta_ypf',
    ordenEnLaRueda: 5,
    padreId: IDS.diego,
    recaudadorId: IDS.laura,
    aportes: aportesIniciales(IDS.diego),
  },
  {
    id: 'colecta-6-camila',
    cicloLectivo: 2026,
    fechaCumpleanos: '2026-11-27',
    montoIndividualPesos: 0,
    montoTotalObjetivo: 0,
    estadoColecta: 'en_recaudacion',
    activo: true,
    beneficiarioNombre: 'Camila',
    esPrimeraVoluntaria: false,
    indiceReferencia: 'nafta_ypf',
    ordenEnLaRueda: 6,
    padreId: IDS.ana,
    recaudadorId: IDS.diego,
    aportes: aportesIniciales(IDS.ana),
  },
]

export const indices: Indice[] = [
  {
    id: 'nafta_ypf',
    nombre: 'Nafta súper YPF',
    unidad: 'litro',
    unidadPlural: 'litros',
    cantidadPorParticipante: 5,
    votos: 4,
  },
  {
    id: 'dolar_mep',
    nombre: 'Dólar MEP',
    unidad: 'dólar',
    unidadPlural: 'dólares',
    cantidadPorParticipante: 5,
    votos: 1,
  },
  {
    id: 'cajita_feliz',
    nombre: 'Cajita Feliz',
    unidad: 'cajita',
    unidadPlural: 'cajitas',
    cantidadPorParticipante: 1,
    votos: 1,
  },
]

/** Quién votó qué índice (para no votar dos veces). */
export const votos: Record<string, IndiceId> = {
  [IDS.juan]: 'nafta_ypf',
  [IDS.maria]: 'nafta_ypf',
  [IDS.carlos]: 'nafta_ypf',
  [IDS.laura]: 'nafta_ypf',
  [IDS.diego]: 'dolar_mep',
  [IDS.ana]: 'cajita_feliz',
}

export const preciosReferencia: PrecioReferencia[] = [
  { id: 'precio-1', indice: 'nafta_ypf', fecha: '2026-03-19', valorUnitarioArs: 1120 },
  { id: 'precio-2', indice: 'nafta_ypf', fecha: '2026-06-29', valorUnitarioArs: 1250 },
  { id: 'precio-3', indice: 'dolar_mep', fecha: '2026-06-29', valorUnitarioArs: 1450 },
  { id: 'precio-4', indice: 'cajita_feliz', fecha: '2026-09-07', valorUnitarioArs: 13900 },
  { id: 'precio-5', indice: 'nafta_ypf', fecha: '2026-09-14', valorUnitarioArs: 1420 },
  { id: 'precio-6', indice: 'nafta_ypf', fecha: '2026-10-08', valorUnitarioArs: 1490 },
  { id: 'precio-7', indice: 'dolar_mep', fecha: '2026-10-08', valorUnitarioArs: 1515 },
  { id: 'precio-8', indice: 'cajita_feliz', fecha: '2026-10-08', valorUnitarioArs: 14500 },
]
