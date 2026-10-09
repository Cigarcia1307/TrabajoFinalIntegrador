/**
 * Identificador estable de un cumpleañero.
 *
 * Provisorio: el backend todavía no le asigna id a Beneficiario, y Colecta solo
 * guarda padreId + beneficiarioNombre. Un padre no tiene dos hijos con el mismo
 * nombre, así que la combinación no se repite.
 *
 * Cuando el backend agregue `beneficiarioId`, se cambia SOLO esta función.
 */
export function idBeneficiario(padreId: string, nombre: string): string {
  return `${padreId}:${nombre}`
}
