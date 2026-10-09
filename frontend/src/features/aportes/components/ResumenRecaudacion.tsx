import { formatearARS } from '../../../lib/formato'
import type { ResumenColecta } from '../../../types/api'

/**
 * Widget de resumen para el recaudador: recaudado vs. objetivo y conteos.
 * Exclusivo de la vista del recaudador (regla de visibilidad).
 */
export function ResumenRecaudacion({ resumen, congelado }: { resumen: ResumenColecta; congelado: boolean }) {
  const porcentaje =
    resumen.montoTotalObjetivo > 0
      ? Math.min(100, Math.round((resumen.recaudado / resumen.montoTotalObjetivo) * 100))
      : 0

  return (
    <div className="flex flex-col gap-4">
      {congelado ? (
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-caption text-texto-suave">Recaudado</p>
            <p className="text-caption text-texto-suave tabular-nums">{porcentaje}%</p>
          </div>
          <p className="tabular-nums">
            <span className="text-h2 font-extrabold">{formatearARS(resumen.recaudado)}</span>{' '}
            <span className="text-texto-suave">de {formatearARS(resumen.montoTotalObjetivo)}</span>
          </p>
          <div
            className="mt-2 h-3 overflow-hidden rounded-full bg-no-participa-bg"
            role="progressbar"
            aria-label="Porcentaje recaudado"
            aria-valuenow={porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-pagado" style={{ width: `${porcentaje}%` }} />
          </div>
        </div>
      ) : (
        <p className="rounded-control bg-crema p-4 text-caption">
          El monto se congela el día hábil anterior al cumple. Hasta entonces podés ver quién participa, pero
          todavía no registrar pagos.
        </p>
      )}

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Dato etiqueta="Pagaron" valor={resumen.cantidadPagaron} />
        <Dato etiqueta="Pendientes" valor={resumen.cantidadPendientes} destacado={resumen.cantidadPendientes > 0} />
        <Dato etiqueta="Sin responder" valor={resumen.cantidadSinResponder} />
        <Dato etiqueta="Participan" valor={resumen.cantidadParticipan} />
      </dl>
    </div>
  )
}

function Dato({ etiqueta, valor, destacado = false }: { etiqueta: string; valor: number; destacado?: boolean }) {
  return (
    <div className={`rounded-control p-3 ${destacado ? 'bg-pendiente-bg text-pendiente' : 'bg-crema'}`}>
      <dt className="text-caption">{etiqueta}</dt>
      <dd className="text-h3 font-extrabold tabular-nums">{valor}</dd>
    </div>
  )
}
