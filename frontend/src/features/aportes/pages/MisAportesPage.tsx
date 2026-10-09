import { useEffect, useState } from 'react'
import { Card } from '../../../components/ui'
import { listarCiclos, listarColectas, obtenerUsuarioActual } from '../../../services'
import type { Colecta } from '../../../types/api'
import { PanelRecaudador } from '../components/PanelRecaudador'
import { TarjetaMiAporte } from '../components/TarjetaMiAporte'

interface Datos {
  enCurso: Colecta[]
  recaudo: Colecta[]
}

async function cargar(): Promise<Datos> {
  const [usuario, ciclos] = await Promise.all([obtenerUsuarioActual(), listarCiclos()])
  const activo = ciclos.find((c) => c.activo)
  if (!activo) return { enCurso: [], recaudo: [] }
  const enCurso = (await listarColectas(activo.anio)).filter((c) => c.estadoColecta === 'en_recaudacion')
  return { enCurso, recaudo: enCurso.filter((c) => c.recaudadorId === usuario.id) }
}

/**
 * "Mis aportes" (ruta /aportes) — Issue #3.
 * Arriba, las colectas que el usuario recauda (vista del recaudador);
 * abajo, su propio aporte en cada colecta en curso (vista del participante).
 */
export function MisAportesPage() {
  const [datos, setDatos] = useState<Datos | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    cargar()
      .then((d) => vigente && setDatos(d))
      .catch(() => vigente && setError('No pudimos cargar las colectas.'))
    return () => {
      vigente = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-h1 font-extrabold">Mis aportes</h1>
        <p className="text-texto-suave">Las colectas en curso y lo que te toca en cada una.</p>
      </header>

      {error && <Card className="border-2 border-error text-error">{error}</Card>}

      {datos && datos.recaudo.length > 0 && (
        <section aria-labelledby="titulo-recaudas" className="flex flex-col gap-4">
          <h2 id="titulo-recaudas" className="text-h2 font-extrabold">
            Colectas que recaudás
          </h2>
          <div className="flex flex-col gap-6">
            {datos.recaudo.map((c) => (
              <PanelRecaudador key={c.id} colectaId={c.id} />
            ))}
          </div>
        </section>
      )}

      {datos && (
        <section aria-labelledby="titulo-aportes" className="flex flex-col gap-4">
          {datos.recaudo.length > 0 && (
            <h2 id="titulo-aportes" className="text-h2 font-extrabold">
              Tus aportes
            </h2>
          )}
          {datos.enCurso.length === 0 ? (
            <Card>
              <p className="font-bold">No hay colectas en curso</p>
              <p className="text-texto-suave">Cuando se acerque el próximo cumple, la vas a ver acá.</p>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {datos.enCurso.map((c) => (
                <TarjetaMiAporte key={c.id} colectaId={c.id} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
