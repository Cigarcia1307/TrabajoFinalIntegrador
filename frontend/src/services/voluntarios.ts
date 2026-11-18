
import { api } from './http'

export type RolVoluntario = 'TITULAR' | 'SUPLENTE'

export interface PostulacionVoluntario {
    id: string
    cicloLectivo: number
    participanteId: string
    rol: RolVoluntario
}

/**
 * POST /api/voluntarios/{anio}
 * Registra al participante autenticado.
 */
export async function postularseVoluntario(
    anio: number
): Promise<PostulacionVoluntario> {
    return api.post<PostulacionVoluntario>(
        `/api/voluntarios/${anio}`,
        {}
    )
}

/**
 * GET /api/voluntarios/{anio}/mi-postulacion
 * Consulta si el participante autenticado ya está postulado.
 * Devuelve null cuando todavía no tiene una postulación.
 */
export async function obtenerMiPostulacion(
    anio: number
): Promise<PostulacionVoluntario | null> {
    return api.get<PostulacionVoluntario | null>(
        `/api/voluntarios/${anio}/mi-postulacion`
    )
}
