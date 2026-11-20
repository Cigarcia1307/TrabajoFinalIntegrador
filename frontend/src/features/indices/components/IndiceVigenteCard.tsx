import { Card } from '../../../components/ui'
import { Scale, Snowflake } from 'lucide-react'
import { cantidadConUnidad, formatearARS, formatearFechaCorta } from '../../../lib/formato'
import type { IndiceVigente } from '../../../types/api'
import type { DatosIndices } from '../hooks/useIndices'

/** Lo que más mira la gente: cuánto se aporta hoy por cumple y cuánto es en pesos. */
export function IndiceVigenteCard({ datos, vigente }: { datos: DatosIndices; vigente: IndiceVigente }) {
  const { catalogo, cotizaciones } = datos
  const indice = catalogo.find((i) => i.id === vigente.indice)
  const cotizacion = cotizaciones[vigente.indice]
  if (!indice) return null

  return (
    <Card elevada className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-caption font-bold text-texto-suave">
            Aporte vigente elegido el {formatearFechaCorta(vigente.vigenteDesde)}
          </p>
          <p className="mt-2 text-monto font-extrabold tabular-nums">
            {cantidadConUnidad(vigente.cantidadUnidades, indice.unidad, indice.unidadPlural)}
          </p>
          <p className="mt-1 flex items-center gap-2 text-lead font-semibold">
            <Scale size={18} aria-hidden /> de {indice.nombre}
          </p>
        </div>
        <span className="hidden size-12 items-center justify-center rounded-full bg-congelado-bg text-congelado sm:flex">
          <Snowflake size={22} aria-hidden />
        </span>
      </div>
      {cotizacion && (
        <p className="rounded-control bg-crema p-3 text-caption">
          <span className="font-bold tabular-nums">≈ {formatearARS(vigente.cantidadUnidades * cotizacion.valorUnitarioArs)}</span> por
          persona con el valor de hoy ({cantidadConUnidad(1, indice.unidad, indice.unidadPlural)} ={' '}
          <span className="tabular-nums">{formatearARS(cotizacion.valorUnitarioArs)}</span> al{' '}
          {formatearFechaCorta(cotizacion.fecha)}). El monto de cada cumple se congela el día hábil anterior.
        </p>
      )}
    </Card>
  )
}
