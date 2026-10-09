/** Error de la API con su código HTTP, igual para mocks y backend real. */
export class ErrorApi extends Error {
  readonly status: number

  constructor(status: number, mensaje: string) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.status = status
  }
}

export const noEncontrado = (que: string) => new ErrorApi(404, `${que} no encontrado`)
export const prohibido = (motivo: string) => new ErrorApi(403, motivo)
