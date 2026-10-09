import type { HTMLAttributes } from 'react'
import { colorCumpleanero } from '../../lib/confeti'

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Si la card corresponde a un cumpleañero, su lugar en la rueda: se marca arriba con su color confeti. */
  ordenEnLaRueda?: number
  /** Sombra sutil para separarla del fondo. Por defecto, sin sombra. */
  elevada?: boolean
}

export function Card({ ordenEnLaRueda, elevada = false, className = '', ...props }: CardProps) {
  const acento = ordenEnLaRueda ? `border-t-8 ${colorCumpleanero(ordenEnLaRueda).borde}` : ''
  return (
    <article
      className={`rounded-card bg-superficie p-4 md:p-6 ${acento} ${elevada ? 'shadow-sutil' : ''} ${className}`}
      {...props}
    />
  )
}
