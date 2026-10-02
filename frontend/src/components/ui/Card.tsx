import type { HTMLAttributes } from 'react'
import { colorCumpleanero } from '../../lib/confeti'

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Si la card corresponde a un cumpleañero, se marca con su color confeti arriba. */
  beneficiarioId?: string
  /** Sombra sutil para separarla del fondo. Por defecto, sin sombra. */
  elevada?: boolean
}

export function Card({ beneficiarioId, elevada = false, className = '', ...props }: CardProps) {
  const acento = beneficiarioId ? `border-t-8 ${colorCumpleanero(beneficiarioId).borde}` : ''
  return (
    <article
      className={`rounded-card bg-superficie p-4 md:p-6 ${acento} ${elevada ? 'shadow-sutil' : ''} ${className}`}
      {...props}
    />
  )
}
