import { Card, PillEstado } from '../../../components/ui'
import { IndiceVigenteCard } from '../components/IndiceVigenteCard'
import { ProponerCambio } from '../components/ProponerCambio'
import { VotacionAbiertaCard } from '../components/VotacionAbiertaCard'
import { useIndices } from '../hooks/useIndices'

/**
 * "Índice" (ruta /indice) — Issue #5.
 * Arriba, cuánto se aporta hoy; abajo, la votación abierta (si hay) o,
 * para el administrador, la opción de abrir una nueva.
 */
export function IndicePage() {
  const { estado, enviando, errorAccion, votar, abrir, cerrar } = useIndices()

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-h1 font-extrabold">Índice de referencia</h1>
        <p className="max-w-prose text-texto-suave">
          El aporte se fija en unidades y no en pesos, para que la inflación no lo achique. El grupo elige el índice y
          la cantidad por votación.
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
          <IndiceVigenteCard datos={estado.datos} />

          {errorAccion && (
            <p role="alert" className="rounded-control border-2 border-error bg-error-bg p-3 text-caption text-error">
              {errorAccion}
            </p>
          )}

          {estado.datos.votacion ? (
            <VotacionAbiertaCard
              datos={estado.datos}
              votacion={estado.datos.votacion}
              enviando={enviando}
              onVotar={votar}
              onCerrar={cerrar}
            />
          ) : estado.datos.esAdministrador ? (
            <ProponerCambio datos={estado.datos} enviando={enviando} onAbrir={abrir} />
          ) : (
            <p className="text-caption text-texto-suave">
              No hay votaciones abiertas. Si el grupo quiere cambiar el índice o la cantidad, la abre un administrador.
            </p>
          )}
        </>
      )}
    </div>
  )
}
