import { useState } from 'react'
import { Boton, Card, PillEstado } from '../../../components/ui'
import { formatearARS, formatearFechaCorta } from '../../../lib/formato'
import type { IndiceId, VotacionAbierta } from '../../../types/api'
import { opcionesMasVotadas } from '../../../services'
import type { DatosIndices } from '../hooks/useIndices'
import { describirOpcion, mismaOpcion, pesosHoy } from '../lib/opciones'

interface Props {
  datos: DatosIndices
  votacion: VotacionAbierta
  enviando: boolean
  onVotar: (indice: IndiceId) => void
  onCerrar: (desempate?: IndiceId) => Promise<boolean>
}

/** La votación abierta: votar (una sola vez) y, después, ver cómo va. */
export function VotacionAbiertaCard({ datos, votacion, enviando, onVotar, onCerrar }: Props) {
  const yaVoto = votacion.miVoto !== null

  return (
    <Card elevada className="flex flex-col gap-5">
      <header className="flex flex-col items-start gap-2">
        <PillEstado estado="pendiente" etiqueta="Votación abierta" />
        <h2 className="text-h3 font-extrabold">¿Cambiamos el aporte?</h2>
        <p className="text-caption text-texto-suave">
          La abrió {votacion.creadaPor} el {formatearFechaCorta(votacion.fechaApertura)} · votaron{' '}
          {votacion.cantidadVotaron} de {votacion.cantidadParticipantes}
        </p>
      </header>

      {yaVoto ? <Resultados datos={datos} votacion={votacion} /> : <Votar datos={datos} votacion={votacion} enviando={enviando} onVotar={onVotar} />}

      <p className="text-caption text-texto-suave">
        Si gana una opción distinta de la actual, se aplica a los cumples que todavía no congelaron su monto. Los
        que ya se congelaron o se cobraron no cambian.
      </p>

      {datos.esAdministrador && <CerrarVotacion datos={datos} votacion={votacion} enviando={enviando} onCerrar={onCerrar} />}
    </Card>
  )
}

function Votar({ datos, votacion, enviando, onVotar }: Pick<Props, 'datos' | 'votacion' | 'enviando' | 'onVotar'>) {
  const [elegida, setElegida] = useState<IndiceId | null>(null)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (elegida) onVotar(elegida)
      }}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">Elegí una opción</legend>
        {votacion.opciones.map((o) => (
          <label
            key={o.indice}
            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-control border-2 p-3 ${
              elegida === o.indice ? 'border-tinta bg-crema' : 'border-borde-control'
            }`}
          >
            <input
              type="radio"
              name="opcion"
              value={o.indice}
              checked={elegida === o.indice}
              onChange={() => setElegida(o.indice)}
              className="size-5 accent-tinta"
            />
            <span className="flex flex-1 flex-col">
              <span className="font-bold">{describirOpcion(o, datos.catalogo)}</span>
              <span className="text-caption text-texto-suave tabular-nums">
                ≈ {formatearARS(pesosHoy(o, datos.cotizaciones))} por persona hoy
              </span>
            </span>
            {mismaOpcion(o, datos.vigente) && <span className="text-caption font-bold text-texto-suave">Actual</span>}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <Boton type="submit" disabled={!elegida || enviando}>
          {enviando ? 'Enviando…' : 'Votar'}
        </Boton>
        <p className="text-caption text-texto-suave">Tu voto no se puede cambiar.</p>
      </div>
    </form>
  )
}

function Resultados({ datos, votacion }: Pick<Props, 'datos' | 'votacion'>) {
  return (
    <section aria-label="Resultados parciales" className="flex flex-col gap-3">
      <p className="font-bold">Ya votaste. Así va la votación:</p>
      <ul className="flex flex-col gap-3">
        {votacion.opciones.map((o) => {
          const porcentaje = votacion.cantidadVotaron > 0 ? Math.round((o.votos / votacion.cantidadVotaron) * 100) : 0
          return (
            <li key={o.indice} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-semibold">
                  {describirOpcion(o, datos.catalogo)}
                  {votacion.miVoto === o.indice && <span className="ml-2 text-caption font-bold">· Tu voto</span>}
                </span>
                <span className="text-caption text-texto-suave tabular-nums">
                  {o.votos} {o.votos === 1 ? 'voto' : 'votos'}
                </span>
              </div>
              <div
                className="h-3 overflow-hidden rounded-full bg-no-participa-bg"
                role="progressbar"
                aria-label={`Votos para ${describirOpcion(o, datos.catalogo)}`}
                aria-valuenow={porcentaje}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-tinta" style={{ width: `${porcentaje}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Solo ADMINISTRADOR. Pide confirmación y, si hay empate, que elija la ganadora. */
function CerrarVotacion({ datos, votacion, enviando, onCerrar }: Pick<Props, 'datos' | 'votacion' | 'enviando' | 'onCerrar'>) {
  const [confirmando, setConfirmando] = useState(false)
  const empatadas = votacion.cantidadVotaron > 0 ? opcionesMasVotadas(votacion.opciones) : votacion.opciones
  const hayEmpate = empatadas.length > 1
  const [desempate, setDesempate] = useState<IndiceId | null>(null)

  if (!confirmando) {
    return (
      <div className="border-t border-borde pt-4">
        <Boton variante="secundario" onClick={() => setConfirmando(true)} className="min-h-11 text-caption">
          Cerrar votación
        </Boton>
      </div>
    )
  }

  const listo = !hayEmpate || desempate !== null
  return (
    <div className="flex flex-col gap-3 border-t border-borde pt-4" role="group" aria-label="Confirmar cierre de la votación">
      <p className="rounded-control bg-pendiente-bg p-3 text-caption text-pendiente">
        <span className="font-bold">
          Votaron {votacion.cantidadVotaron} de {votacion.cantidadParticipantes}.
        </span>{' '}
        {hayEmpate
          ? 'Hay empate: elegí cuál de estas opciones queda vigente.'
          : `Va a quedar vigente: ${describirOpcion(empatadas[0], datos.catalogo)}.`}
      </p>
      {hayEmpate && (
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Opción ganadora</legend>
          {empatadas.map((o) => (
            <label key={o.indice} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="desempate"
                checked={desempate === o.indice}
                onChange={() => setDesempate(o.indice)}
                className="size-5 accent-tinta"
              />
              {describirOpcion(o, datos.catalogo)}
            </label>
          ))}
        </fieldset>
      )}
      <div className="flex flex-wrap gap-2">
        <Boton
          variante="secundario"
          disabled={!listo || enviando}
          onClick={async () => {
            if (await onCerrar(desempate ?? undefined)) setConfirmando(false)
          }}
          className="min-h-11 text-caption"
        >
          Sí, cerrar votación
        </Boton>
        <Boton variante="texto" onClick={() => setConfirmando(false)} className="text-caption">
          Cancelar
        </Boton>
      </div>
    </div>
  )
}
