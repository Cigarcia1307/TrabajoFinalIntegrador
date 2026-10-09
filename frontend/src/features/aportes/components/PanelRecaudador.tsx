import { useState } from "react";
import {
  AvatarCumpleanero,
  Boton,
  Card,
  PillEstado,
  type Estado,
} from "../../../components/ui";
import {
  formatearARS,
  formatearFechaCorta,
  formatearFechaLarga,
} from "../../../lib/formato";
import type { Aporte } from "../../../types/api";
import { useRecaudacion, type FilaAporte } from "../hooks/useRecaudacion";
import { ResumenRecaudacion } from "./ResumenRecaudacion";

function estadoDe(a: Aporte): { estado: Estado; etiqueta: string } {
  if (a.pagado)
    return {
      estado: "pagado",
      etiqueta: a.fechaPago
        ? `Pagó el ${formatearFechaCorta(a.fechaPago)}`
        : "Pagó",
    };
  if (a.participa === true)
    return { estado: "pendiente", etiqueta: "Pendiente" };
  if (a.participa === false)
    return { estado: "no-participa", etiqueta: "No participa" };
  return { estado: "pendiente", etiqueta: "Sin responder" };
}

/**
 * Vista del recaudador para UNA colecta (Issue #3): resumen + estado de todos.
 * Solo se muestra al recaudador de esa colecta; el backend lo exige igual.
 *
 * Uso: <PanelRecaudador colectaId={colecta.id} />
 */
export function PanelRecaudador({ colectaId }: { colectaId: string }) {
  const { estado, guardandoId, errorAccion, marcarPago } =
    useRecaudacion(colectaId);

  if (estado.tipo === "cargando") {
    return <Card className="h-64 animate-pulse" aria-busy="true" />;
  }
  if (estado.tipo === "error") {
    return (
      <Card className="border-2 border-error">
        <PillEstado estado="error" etiqueta="No pudimos cargar la colecta" />
        <p className="mt-2 text-caption text-texto-suave">{estado.mensaje}</p>
      </Card>
    );
  }

  const { colecta, resumen, filas, congelado } = estado.datos;
  const abierta = colecta.estadoColecta === "en_recaudacion";

  return (
    <Card
      ordenEnLaRueda={colecta.ordenEnLaRueda}
      elevada
      className="flex flex-col gap-6"
    >
      <header className="flex items-center gap-3">
        <AvatarCumpleanero
          ordenEnLaRueda={colecta.ordenEnLaRueda}
          nombre={colecta.beneficiarioNombre}
          tamano="lg"
        />
        <div>
          <p className="text-caption text-texto-suave">
            Recaudás vos · {formatearFechaLarga(colecta.fechaCumpleanos)}
            {congelado &&
              ` · ${formatearARS(colecta.montoIndividualPesos)} por persona`}
          </p>
          <h2 className="text-h3 font-extrabold">
            Cumple de {colecta.beneficiarioNombre}
          </h2>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <ResumenRecaudacion resumen={resumen} congelado={congelado} />

        <section aria-label="Estado de cada participante">
          {errorAccion && (
            <p
              role="alert"
              className="mb-3 rounded-control border-2 border-error p-3 text-caption text-error"
            >
              {errorAccion}
            </p>
          )}
          <h3 className="mb-2 font-extrabold">Participantes</h3>
          <ul className="divide-y divide-borde">
            {filas.map((fila) => (
              <FilaParticipante
                key={fila.aporte.padreId}
                fila={fila}
                puedeMarcar={abierta && congelado}
                guardando={guardandoId === fila.aporte.padreId}
                onMarcar={(pagado) => marcarPago(fila.aporte.padreId, pagado)}
              />
            ))}
          </ul>
        </section>
      </div>
    </Card>
  );
}

interface FilaProps {
  fila: FilaAporte;
  puedeMarcar: boolean;
  guardando: boolean;
  onMarcar: (pagado: boolean) => void;
}

function FilaParticipante({
  fila,
  puedeMarcar,
  guardando,
  onMarcar,
}: FilaProps) {
  const { aporte, participante } = fila;
  const { estado, etiqueta } = estadoDe(aporte);
  const nombre = participante
    ? `${participante.nombre} ${participante.apellido}`
    : "Participante";
  const [confirmandoDeshacer, setConfirmandoDeshacer] = useState(false);

  // Deshacer un pago pide confirmación: sirve para corregir errores, no para tocar sin querer.
  if (confirmandoDeshacer) {
    return (
      <li
        className="flex flex-col gap-3 py-3"
        role="group"
        aria-label={`Confirmar deshacer el pago de ${nombre}`}
      >
        <p className="rounded-control bg-pendiente-bg p-3 text-caption text-pendiente">
          <span className="font-bold">¿Deshacer el pago de {nombre}?</span> Va a
          volver a figurar como pendiente. Usalo solo si lo registraste por
          error o si la transferencia no llegó.
        </p>
        <div className="flex flex-wrap gap-2">
          <Boton
            variante="secundario"
            onClick={() => {
              setConfirmandoDeshacer(false);
              onMarcar(false);
            }}
            className="min-h-11 text-caption"
          >
            Sí, deshacer
          </Boton>
          <Boton
            variante="texto"
            onClick={() => setConfirmandoDeshacer(false)}
            className="text-caption"
          >
            Cancelar
          </Boton>
        </div>
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
      <div className="flex flex-col items-start gap-1">
        <span className="font-bold">{nombre}</span>
        <PillEstado estado={estado} etiqueta={etiqueta} />
      </div>
      {puedeMarcar &&
        aporte.participa !== false &&
        (aporte.pagado ? (
          <Boton
            variante="texto"
            onClick={() => setConfirmandoDeshacer(true)}
            disabled={guardando}
            className="whitespace-nowrap text-caption"
          >
            Deshacer pago
          </Boton>
        ) : (
          <Boton
            variante="secundario"
            onClick={() => onMarcar(true)}
            disabled={guardando}
            className="min-h-11 whitespace-nowrap text-caption"
          >
            {guardando ? "Guardando…" : "Registrar pago"}
          </Boton>
        ))}
    </li>
  );
}
