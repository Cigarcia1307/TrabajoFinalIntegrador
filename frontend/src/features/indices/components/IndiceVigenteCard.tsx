import { Card } from '../../../components/ui'
import { cantidadConUnidad, formatearARS, formatearFechaCorta } from '../../../lib/formato'
import type { DatosIndices } from '../hooks/useIndices'
import { pesosHoy } from '../lib/opciones'

/** Lo que más mira la gente: cuánto se aporta hoy por cumple y cuánto es en pesos. */
export function IndiceVigenteCard({ datos }: { datos: DatosIndices }) {
  const { vigente, catalogo, cotizaciones } = datos
  const indice = catalogo.find((i) => i.id === vigente.indice)
  const cotizacion = cotizaciones[vigente.indice]
  if (!indice) return null

  return (
    <Card elevada className="flex flex-col gap-4">
      <p className="text-caption text-texto-suave">
        Aporte por cumple · vigente desde el {formatearFechaCorta(vigente.vigenteDesde)}
      </p>
      <div>
        <p className="text-monto font-extrabold">
          {cantidadConUnidad(vigente.cantidadUnidades, indice.unidad, indice.unidadPlural)}
        </p>
        <p className="text-lead font-semibold">de {indice.nombre}</p>
      </div>
      {cotizacion && (
        <p className="rounded-control bg-crema p-3 text-caption">
          <span className="font-bold tabular-nums">≈ {formatearARS(pesosHoy(vigente, cotizaciones))}</span> por
          persona con el valor de hoy ({cantidadConUnidad(1, indice.unidad, indice.unidadPlural)} ={' '}
          <span className="tabular-nums">{formatearARS(cotizacion.valorUnitarioArs)}</span> al{' '}
          {formatearFechaCorta(cotizacion.fecha)}). El monto de cada cumple se congela el día hábil anterior.
        </p>
      )}
    </Card>
  )
}
