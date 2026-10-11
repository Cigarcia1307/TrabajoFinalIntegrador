import { Card, PillEstado } from '../../../components/ui'
import { AbrirVotacion } from '../components/AbrirVotacion'
import { IndiceVigenteCard } from '../components/IndiceVigenteCard'
import { VotacionAbiertaCard } from '../components/VotacionAbiertaCard'
import { useIndices, type DatosIndices } from '../hooks/useIndices'

/**
 * "Índice" (ruta /indice) — Issue #5.
 * El índice y la cantidad se votan una sola vez por ciclo y no cambian en el año.
 * La pantalla muestra lo elegido o, al inicio del ciclo, la votación.
 */
export function IndicePage() {
  const { estado, enviando, errorAccion, votar, abrir, cerrar } = useIndices()

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-h1 font-extrabold">Índice de referencia</h1>
        <p className="max-w-prose text-texto-suave">
          El aporte se fija en unidades y no en pesos, para que la inflación no lo achique. El grupo elige el índice y
          la cantidad una vez por año, por votación, y rige para todos los cumples del ciclo.
        </p>
      </header>

      {estado.tipo === 'cargando' && <Card className="h-48 animate-pulse" aria-busy="true" />}

      {estado.tipo === 'error' && (
        <Card className="border-2 border-error">
          <PillEstado estado="error" etiqueta="No pudimos cargar el índice" />
          <p className="mt-2 text-caption text-texto-suave">{estado.mensaje}</p>
        </Card>
      )}

      {estado.tipo === 'listo' && (
        <>
          {estado.datos.vigente ? (
            <IndiceVigenteCard datos={estado.datos} vigente={estado.datos.vigente} />
          ) : (
            <SinIndice datos={estado.datos} />
          )}

          {errorAccion && (
            <p role="alert" className="rounded-control border-2 border-error bg-error-bg p-3 text-caption text-error">
              {errorAccion}
            </p>
          )}

          {estado.datos.votacion && (
            <VotacionAbiertaCard
              datos={estado.datos}
              votacion={estado.datos.votacion}
              enviando={enviando}
              onVotar={votar}
              onCerrar={cerrar}
            />
          )}

          {!estado.datos.vigente && !estado.datos.votacion && estado.datos.esAdministrador && (
            <AbrirVotacion datos={estado.datos} enviando={enviando} onAbrir={abrir} />
          )}
        </>
      )}
    </div>
  )
}

/** Inicio del ciclo: todavía no hay índice elegido. */
function SinIndice({ datos }: { datos: DatosIndices }) {
  return (
    <Card className="flex flex-col gap-2">
      <p className="font-bold">Todavía no se eligió el índice de este año.</p>
      <p className="text-caption text-texto-suave">
        {datos.votacion
          ? 'La votación está abierta: cuando cierre, vas a ver acá cuánto aporta cada uno por cumple.'
          : datos.esAdministrador
            ? 'Armá la votación para que el grupo elija con qué aporta este año.'
            : 'Un administrador va a abrir la votación para que el grupo elija con qué aporta este año.'}
      </p>
    </Card>
  )
}
