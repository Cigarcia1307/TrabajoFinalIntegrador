import { useState } from 'react'
import { Boton, Card } from '../../../components/ui'
import { cantidadConUnidad, formatearARS, formatearFechaCorta } from '../../../lib/formato'
import type { CargaCotizacion, IndiceId } from '../../../types/api'
import type { DatosIndices } from '../hooks/useIndices'

interface Props {
  datos: DatosIndices
  enviando: boolean
  onCargar: (indice: IndiceId, carga: CargaCotizacion) => Promise<boolean>
}

/** De dónde sale el precio de cada índice (ver CotizacionStrategy en el backend). */
const FUENTE: Record<IndiceId, string> = {
  dolar_mep: 'Se actualiza solo (API pública del dólar MEP)',
  nafta_ypf: 'Se actualiza solo (datos abiertos de la Secretaría de Energía)',
  cajita_feliz: 'Lo carga un administrador: no hay fuente pública',
}

/**
 * Solo ADMINISTRADOR. Muestra el precio de hoy de cada índice y permite cargar
 * uno a mano: es la fuente de la Cajita Feliz y el respaldo de los automáticos.
 */
export function PreciosIndices({ datos, enviando, onCargar }: Props) {
  const [indice, setIndice] = useState<IndiceId>('cajita_feliz')
  const [valor, setValor] = useState('')
  const numero = Number(valor)
  const valido = valor !== '' && Number.isFinite(numero) && numero > 0
  const elegido = datos.catalogo.find((i) => i.id === indice)

  return (
    <Card className="flex flex-col gap-5">
      <header>
        <h2 className="text-h3 font-extrabold">Precios de los índices</h2>
        <p className="text-caption text-texto-suave">
          Con estos valores se calcula el monto de cada cumple al congelarse. Los automáticos se actualizan solos; si
          su fuente falla, se usa el último precio cargado acá.
        </p>
      </header>

      <ul className="divide-y divide-borde">
        {datos.catalogo.map((i) => {
          const c = datos.cotizaciones[i.id]
          return (
            <li key={i.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
              <div>
                <p className="font-bold">{i.nombre}</p>
                <p className="text-caption text-texto-suave">{FUENTE[i.id]}</p>
              </div>
              <p className="text-caption tabular-nums">
                {c ? (
                  <>
                    <span className="font-bold">
                      {cantidadConUnidad(1, i.unidad, i.unidadPlural)} = {formatearARS(c.valorUnitarioArs)}
                    </span>{' '}
                    al {formatearFechaCorta(c.fecha)}
                    {c.fuente === 'cargada' && ' · cargado a mano'}
                  </>
                ) : (
                  <span className="font-bold text-error">Sin precio</span>
                )}
              </p>
            </li>
          )
        })}
      </ul>

      <form
        className="flex flex-col gap-3 rounded-control bg-crema p-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (valido && (await onCargar(indice, { valorUnitarioArs: numero }))) setValor('')
        }}
      >
        <p className="font-bold">Cargar un precio de hoy</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-col gap-1 text-caption font-semibold">
            Índice
            <select
              value={indice}
              onChange={(e) => setIndice(e.target.value as IndiceId)}
              className="h-11 rounded-control border-2 border-borde-control bg-superficie px-3 text-body"
            >
              {datos.catalogo.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-caption font-semibold">
            Precio de 1 {elegido?.unidad ?? 'unidad'} (en pesos)
            <input
              type="number"
              inputMode="decimal"
              min={0.01}
              step={0.01}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="h-11 w-40 rounded-control border-2 border-borde-control bg-superficie px-3 text-body tabular-nums"
            />
          </label>
          <Boton type="submit" variante="secundario" disabled={!valido || enviando}>
            {enviando ? 'Guardando…' : 'Guardar precio'}
          </Boton>
        </div>
      </form>
    </Card>
  )
}
