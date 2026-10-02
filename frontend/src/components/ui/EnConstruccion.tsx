import { Card } from './Card'

interface EnConstruccionProps {
  titulo: string
  responsable: string
  issue: number
}

/** Marcador temporal para pantallas que todavía no se desarrollaron. */
export function EnConstruccion({ titulo, responsable, issue }: EnConstruccionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-h1 font-extrabold">{titulo}</h1>
      <Card>
        <p className="text-texto-suave">
          Pantalla en construcción · a cargo de {responsable} · Issue #{issue}
        </p>
      </Card>
    </section>
  )
}
