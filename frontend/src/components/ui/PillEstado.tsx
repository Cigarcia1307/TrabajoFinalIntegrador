import { CircleCheck, Clock, Minus, Snowflake, TriangleAlert, type LucideIcon } from 'lucide-react'

export type Estado = 'pagado' | 'pendiente' | 'congelado' | 'no-participa' | 'error'

// Clases escritas completas a propósito: Tailwind no detecta clases armadas con template strings.
const config: Record<Estado, { clases: string; Icono: LucideIcon; etiqueta: string }> = {
  pagado: { clases: 'bg-pagado-bg text-pagado', Icono: CircleCheck, etiqueta: 'Pagado' },
  pendiente: { clases: 'bg-pendiente-bg text-pendiente', Icono: Clock, etiqueta: 'Pendiente' },
  congelado: { clases: 'bg-congelado-bg text-congelado', Icono: Snowflake, etiqueta: 'Monto congelado' },
  'no-participa': { clases: 'bg-no-participa-bg text-no-participa', Icono: Minus, etiqueta: 'No participa' },
  error: { clases: 'bg-error-bg text-error', Icono: TriangleAlert, etiqueta: 'Error' },
}

interface PillEstadoProps {
  estado: Estado
  /** Reemplaza el texto por defecto. El ícono siempre se muestra: el color nunca va solo. */
  etiqueta?: string
}

export function PillEstado({ estado, etiqueta }: PillEstadoProps) {
  const { clases, Icono, etiqueta: porDefecto } = config[estado]
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-caption font-bold ${clases}`}
    >
      <Icono size={14} strokeWidth={2.4} aria-hidden />
      {etiqueta ?? porDefecto}
    </span>
  )
}
