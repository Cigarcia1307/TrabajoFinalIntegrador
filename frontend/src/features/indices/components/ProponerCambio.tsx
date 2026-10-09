import { useState } from 'react'
import { Boton, Card } from '../../../components/ui'
import { formatearARS } from '../../../lib/formato'
import type { IndiceId, OpcionIndice } from '../../../types/api'
import type { DatosIndices } from '../hooks/useIndices'
import { pesosHoy } from '../lib/opciones'

interface Props {
  datos: DatosIndices
  enviando: boolean
  onAbrir: (opciones: OpcionIndice[]) => Promise<boolean>
}

type Borrador = Record<IndiceId, { incluida: boolean; cantidad: string }>

/** Solo ADMINISTRADOR y sin votación abierta: arma una votación nueva para cambiar índice o cantidad. */
export function ProponerCambio({ datos, enviando, onAbrir }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [borrador, setBorrador] = useState<Borrador>(() => borradorInicial(datos))

  if (!abierto) {
    return (
      <Card className="flex flex-col items-start gap-3">
        <h2 className="text-h3 font-extrabold">¿Cambiar el índice o la cantidad?</h2>
        <p className="text-texto-suave">
          Si el aporte quedó corto o el grupo prefiere otro índice, abrí una votación. Votan todos los participantes.
        </p>
        <Boton variante="secundario" onClick={() => setAbierto(true)}>
          Proponer un cambio
        </Boton>
      </Card>
    )
  }

  const opciones: OpcionIndice[] = datos.catalogo
    .filter((i) => borrador[i.id].incluida)
    .map((i) => ({ indice: i.id, cantidadUnidades: Number(borrador[i.id].cantidad) }))
  const cantidadesValidas = opciones.every((o) => Number.isFinite(o.cantidadUnidades) && o.cantidadUnidades > 0)
  const valida = opciones.length >= 2 && cantidadesValidas

  return (
    <Card elevada>
      <form
        className="flex flex-col gap-5"
        onSubmit={async (e) => {
          e.preventDefault()
          if (valida && (await onAbrir(opciones))) setAbierto(false)
        }}
      >
        <header>
          <h2 className="text-h3 font-extrabold">Nueva votación</h2>
          <p className="text-caption text-texto-suave">
            Elegí al menos 2 opciones y cuántas unidades aporta cada participante en cada una.
          </p>
        </header>

        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Opciones de la votación</legend>
          {datos.catalogo.map((indice) => {
            const fila = borrador[indice.id]
            const cantidad = Number(fila.cantidad)
            const idInput = `cantidad-${indice.id}`
            return (
              <div
                key={indice.id}
                className={`grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-control border-2 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] ${
                  fila.incluida ? 'border-tinta' : 'border-borde-control'
                }`}
              >
                <input
                  type="checkbox"
                  id={`incluir-${indice.id}`}
                  checked={fila.incluida}
                  onChange={(e) => setBorrador({ ...borrador, [indice.id]: { ...fila, incluida: e.target.checked } })}
                  className="size-5 accent-tinta"
                />
                <label htmlFor={`incluir-${indice.id}`} className="cursor-pointer font-bold">
                  {indice.nombre}
                </label>
                <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                  <label htmlFor={idInput} className="sr-only">
                    Cantidad de {indice.unidadPlural}
                  </label>
                  <input
                    id={idInput}
                    type="number"
                    inputMode="decimal"
                    min={0.5}
                    step={0.5}
                    disabled={!fila.incluida}
                    value={fila.cantidad}
                    onChange={(e) => setBorrador({ ...borrador, [indice.id]: { ...fila, cantidad: e.target.value } })}
                    className="h-11 w-20 rounded-control border-2 border-borde-control bg-superficie px-3 tabular-nums disabled:opacity-50"
                  />
                  <span className="text-caption">{cantidad === 1 ? indice.unidad : indice.unidadPlural}</span>
                </div>
                {fila.incluida && cantidad > 0 && (
                  <p className="col-start-2 text-caption text-texto-suave tabular-nums sm:col-span-2">
                    ≈ {formatearARS(pesosHoy({ indice: indice.id, cantidadUnidades: cantidad }, datos.cotizaciones))} por
                    persona hoy
                  </p>
                )}
              </div>
            )
          })}
        </fieldset>

        {!valida && (
          <p className="text-caption text-texto-suave">
            {opciones.length < 2 ? 'Faltan opciones: elegí al menos 2.' : 'Cada opción necesita una cantidad mayor a 0.'}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Boton type="submit" disabled={!valida || enviando}>
            {enviando ? 'Abriendo…' : 'Abrir votación'}
          </Boton>
          <Boton variante="texto" onClick={() => setAbierto(false)}>
            Cancelar
          </Boton>
        </div>
      </form>
    </Card>
  )
}

/** Arranca con todos los índices marcados; el vigente con su cantidad actual. */
function borradorInicial(datos: DatosIndices): Borrador {
  return Object.fromEntries(
    datos.catalogo.map((i) => [
      i.id,
      { incluida: true, cantidad: String(i.id === datos.vigente.indice ? datos.vigente.cantidadUnidades : 1) },
    ]),
  ) as Borrador
}
