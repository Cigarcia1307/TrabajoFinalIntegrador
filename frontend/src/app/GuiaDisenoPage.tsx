import { AvatarCumpleanero, Boton, Card, PillEstado, type Estado } from '../components/ui'
import { formatearARS } from '../lib/formato'

const estados: Estado[] = ['pagado', 'pendiente', 'congelado', 'no-participa', 'error']

const confeti = [
  { nombre: 'Mostaza', clase: 'bg-confeti-mostaza' },
  { nombre: 'Turquesa', clase: 'bg-confeti-turquesa' },
  { nombre: 'Coral', clase: 'bg-confeti-coral' },
  { nombre: 'Lila', clase: 'bg-confeti-lila' },
  { nombre: 'Cielo', clase: 'bg-confeti-cielo' },
]

/**
 * Guía viva del sistema de diseño (ruta /diseno).
 * Muestra los componentes base y los tokens tal como se ven en la app.
 * Si agregás un componente a components/ui, sumalo acá.
 */
export function GuiaDisenoPage() {
  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="text-caption text-texto-suave">Sistema de diseño "Confeti"</p>
        <h1 className="text-h1 font-extrabold">Guía de componentes</h1>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2 font-extrabold">Botones</h2>
        <div className="flex flex-wrap gap-3">
          <Boton>Ya transferí</Boton>
          <Boton variante="secundario">Copiar alias</Boton>
          <Boton variante="texto">No participo esta vez</Boton>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2 font-extrabold">Estados</h2>
        <div className="flex flex-wrap gap-2">
          {estados.map((estado) => (
            <PillEstado key={estado} estado={estado} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2 font-extrabold">Confeti (color por cumpleañero)</h2>
        <div className="flex flex-wrap gap-4">
          {confeti.map(({ nombre, clase }) => (
            <div key={nombre} className="flex flex-col items-center gap-1">
              <span className={`size-14 rounded-full ${clase}`} />
              <span className="text-caption text-texto-suave">{nombre}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <AvatarCumpleanero beneficiarioId="b-martina" nombre="Martina" />
          <AvatarCumpleanero beneficiarioId="b-tomas" nombre="Tomás" />
          <AvatarCumpleanero beneficiarioId="b-sofia" nombre="Sofía" />
          <AvatarCumpleanero beneficiarioId="b-carla" nombre="Carla" pasado />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2 font-extrabold">Card con monto</h2>
        <Card beneficiarioId="b-martina" elevada className="max-w-md">
          <p className="text-caption text-texto-suave">Tu aporte</p>
          <p className="text-monto font-extrabold tabular-nums">{formatearARS(7450)}</p>
          <p className="text-caption text-texto-suave">5 litros de nafta súper</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PillEstado estado="congelado" />
            <PillEstado estado="pendiente" />
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2 font-extrabold">Aviso de recaudador</h2>
        <p className="text-texto-suave">
          Destacado en mostaza a propósito: tiene que llamar la atención cuando a alguien le toca.
        </p>
        <div className="max-w-md rounded-card bg-confeti-mostaza p-4">
          <p className="font-extrabold">Te toca recaudar</p>
          <p>Cumple de Tomás · 14 de julio</p>
        </div>
      </section>
    </div>
  )
}
