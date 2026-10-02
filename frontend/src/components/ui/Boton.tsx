import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'texto'

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primario: uno solo por pantalla. secundario: acción alternativa. texto: acción menor. */
  variante?: Variante
  /** Ocupa todo el ancho disponible (útil en mobile). */
  anchoCompleto?: boolean
}

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variantes: Record<Variante, string> = {
  primario: 'bg-tinta text-white hover:bg-tinta-hover',
  secundario: 'border-2 border-tinta text-tinta hover:bg-tinta/5',
  texto: 'text-tinta underline underline-offset-4 hover:bg-tinta/5',
}

export function Boton({
  variante = 'primario',
  anchoCompleto = false,
  type = 'button',
  className = '',
  ...props
}: BotonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variantes[variante]} ${anchoCompleto ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}
