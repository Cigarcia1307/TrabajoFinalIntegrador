import { useEffect, useState } from 'react'
import { Card } from '../../../components/ui'
import { listarCiclos, listarColectas } from '../../../services'
import type { Colecta } from '../../../types/api'
import { TarjetaMiAporte } from '../components/TarjetaMiAporte'

/**
 * "Mis aportes" (ruta /aportes): las colectas en curso del ciclo activo,
 * cada una con el estado del aporte del usuario. Issue #3 · vista del participante.
 */
export function MisAportesPage() {
  const [colectas, setColectas] = useState<Colecta[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    ;(async () => {
      const ciclos = await listarCiclos()
      const activo = ciclos.find((c) => c.activo)
      if (!activo) return []
      const todas = await listarColectas(activo.anio)
      return todas.filter((c) => c.estadoColecta === 'en_recaudacion')
    })()
      .then((lista) => vigente && setColectas(lista))
      .catch(() => vigente && setError('No pudimos cargar las colectas.'))
    return () => {
      vigente = false
    }
  }, [])

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-h1 font-extrabold">Mis aportes</h1>
        <p className="text-texto-suave">Las colectas en curso y lo que te toca aportar en cada una.</p>
      </header>

      {error && <Card className="border-2 border-error text-error">{error}</Card>}

      {colectas?.length === 0 && (
        <Card>
          <p className="font-bold">No hay colectas en curso</p>
          <p className="text-texto-suave">Cuando se acerque el próximo cumple, la vas a ver acá.</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {colectas?.map((c) => <TarjetaMiAporte key={c.id} colectaId={c.id} />)}
      </div>
    </section>
  )
}
