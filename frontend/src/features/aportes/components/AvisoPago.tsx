import { Bell, BellRing, Snowflake, type LucideIcon } from 'lucide-react'
import type { Aporte, Colecta } from '../../../types/api'
import { textoAvisoParticipante, type NivelRecordatorio } from '../lib/recordatorios'

// Clases completas a propósito (Tailwind no detecta clases armadas con template strings).
const estilos: Record<NivelRecordatorio, { clases: string; Icono: LucideIcon }> = {
  aviso: { clases: 'bg-congelado-bg text-congelado', Icono: Snowflake },
  recordatorio: { clases: 'bg-pendiente-bg text-pendiente', Icono: Bell },
  urgente: { clases: 'border-2 border-pendiente bg-pendiente-bg text-pendiente', Icono: BellRing },
}

/**
 * Recordatorio de pago para el participante, dentro de su tarjeta.
 * Sube de tono con los días que pasaron desde el cumple. Mostrar solo si
 * `necesitaRecordatorio(colecta, aporte)` es true.
 */
export function AvisoPago({ colecta, aporte }: { colecta: Colecta; aporte: Aporte }) {
  const { nivel, titulo, detalle } = textoAvisoParticipante(colecta, aporte)
  const { clases, Icono } = estilos[nivel]

  return (
    <div role="status" className={`flex items-start gap-3 rounded-control p-3 ${clases}`}>
      <Icono size={20} className="mt-0.5 shrink-0" aria-hidden />
      <p className="text-caption">
        <span className="block font-bold">{titulo}</span>
        {detalle}
      </p>
    </div>
  )
}
