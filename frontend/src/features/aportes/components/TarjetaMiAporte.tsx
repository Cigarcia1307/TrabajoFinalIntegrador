import { Gift } from 'lucide-react'
import { AvatarCumpleanero, Boton, Card, PillEstado } from '../../../components/ui'
import { cantidadConUnidad, formatearARS, formatearFechaCorta, formatearFechaLarga } from '../../../lib/formato'
import { useMiAporte, type DatosMiAporte } from '../hooks/useMiAporte'
import { BotonCopiar } from './BotonCopiar'

/**
 * Vista del participante para UNA colecta (Issue #3).
 * Muestra solo su propio estado — nunca el de otros participantes.
 *
 * Uso: <TarjetaMiAporte colectaId={colecta.id} />
 * Pensada para reutilizarse en Inicio y en el detalle de colecta.
 */
export function TarjetaMiAporte({ colectaId }: { colectaId: string }) {
  const { estado, guardando, responder } = useMiAporte(colectaId)

  if (estado.tipo === 'cargando') {
    return (
      <Card className="animate-pulse" aria-busy="true">
        <div className="h-5 w-40 rounded-full bg-no-participa-bg" />
        <div className="mt-4 h-9 w-32 rounded-full bg-no-participa-bg" />
      </Card>
    )
  }

  if (estado.tipo === 'error') {
    return (
      <Card className="border-2 border-error">
        <p className="flex items-center gap-2 font-bold text-error">
          <PillEstado estado="error" etiqueta="No pudimos cargar tu aporte" />
        </p>
        <p className="mt-2 text-caption text-texto-suave">{estado.mensaje}</p>
      </Card>
    )
  }

  const d = estado.datos

  return (
    <Card ordenEnLaRueda={d.colecta.ordenEnLaRueda} elevada className="flex flex-col gap-5">
      <Encabezado datos={d} />
      {d.aporte === null ? (
        <EsTuCumple nombre={d.colecta.beneficiarioNombre} />
      ) : (
        <>
          <Monto datos={d} />
          <Estados datos={d} />
          <Acciones datos={d} guardando={guardando} responder={responder} />
        </>
      )}
    </Card>
  )
}

function Encabezado({ datos }: { datos: DatosMiAporte }) {
  return (
    <header className="flex items-center gap-3">
      <AvatarCumpleanero ordenEnLaRueda={datos.colecta.ordenEnLaRueda} nombre={datos.colecta.beneficiarioNombre} tamano="lg" />
      <div>
        <p className="text-caption text-texto-suave">
          {datos.colecta.estadoColecta === 'cerrada' ? 'Colecta cerrada' : 'Colecta'} ·{' '}
          {formatearFechaLarga(datos.colecta.fechaCumpleanos)}
        </p>
        <h2 className="text-h3 font-extrabold">Cumple de {datos.colecta.beneficiarioNombre}</h2>
      </div>
    </header>
  )
}

function Monto({ datos }: { datos: DatosMiAporte }) {
  const { indice } = datos
  return (
    <div>
      <p className="text-caption text-texto-suave">Tu aporte</p>
      <p className="text-monto font-extrabold tabular-nums">{formatearARS(datos.monto)}</p>
      <p className="text-caption text-texto-suave">
        {cantidadConUnidad(datos.cantidadUnidades, indice.unidad, indice.unidadPlural)} de {indice.nombre}
        {datos.fechaEstimacion &&
          ` · estimado con el valor del ${formatearFechaCorta(datos.fechaEstimacion)}; se congela el día hábil anterior al cumple`}
      </p>
    </div>
  )
}

function Estados({ datos }: { datos: DatosMiAporte }) {
  const aporte = datos.aporte!
  if (!datos.congelado && !aporte.pagado && aporte.participa === null) return null
  return (
    <div className="flex flex-wrap gap-2">
      {datos.congelado && <PillEstado estado="congelado" />}
      {aporte.pagado ? (
        <PillEstado
          estado="pagado"
          etiqueta={aporte.fechaPago ? `Pagado el ${formatearFechaCorta(aporte.fechaPago)}` : 'Pagado'}
        />
      ) : aporte.participa === false ? (
        <PillEstado estado="no-participa" />
      ) : aporte.participa === true ? (
        <PillEstado estado="pendiente" />
      ) : null}
    </div>
  )
}

interface AccionesProps {
  datos: DatosMiAporte
  guardando: boolean
  responder: (participa: boolean) => Promise<void>
}

function Acciones({ datos, guardando, responder }: AccionesProps) {
  const aporte = datos.aporte!
  if (datos.colecta.estadoColecta === 'cerrada' || aporte.pagado) return null

  // Todavía no respondió
  if (aporte.participa === null) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-bold">¿Participás de esta colecta?</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Boton onClick={() => responder(true)} disabled={guardando} anchoCompleto>
            Sí, participo
          </Boton>
          <Boton variante="secundario" onClick={() => responder(false)} disabled={guardando} anchoCompleto>
            Esta vez no
          </Boton>
        </div>
      </div>
    )
  }

  // Decidió no participar
  if (aporte.participa === false) {
    return (
      <Boton variante="texto" onClick={() => responder(true)} disabled={guardando} className="-ml-2 self-start">
        Cambié de idea, quiero participar
      </Boton>
    )
  }

  // Participa y todavía no pagó: datos para transferir
  const { recaudador } = datos
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-control bg-crema p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-caption text-texto-suave">
            Transferile a {recaudador.nombre} {recaudador.apellido.charAt(0)}. (recaudador/a)
          </p>
          <p className="font-bold break-all">{recaudador.cbuAlias}</p>
        </div>
        <BotonCopiar texto={recaudador.cbuAlias} etiqueta="Copiar alias" />
      </div>
      <p className="text-caption text-texto-suave">
        Cuando {recaudador.nombre} reciba tu transferencia, va a marcar tu aporte como pagado.
      </p>
      <Boton variante="texto" onClick={() => responder(false)} disabled={guardando} className="-ml-2 self-start">
        Esta vez no participo
      </Boton>
    </div>
  )
}

function EsTuCumple({ nombre }: { nombre: string }) {
  return (
    <div className="flex items-start gap-3 rounded-control bg-crema p-4">
      <Gift size={22} className="mt-0.5 shrink-0" aria-hidden />
      <p>
        <span className="font-bold">¡Es el cumple de {nombre}!</span> En esta colecta no aportás: el grupo junta para
        su regalo.
      </p>
    </div>
  )
}
