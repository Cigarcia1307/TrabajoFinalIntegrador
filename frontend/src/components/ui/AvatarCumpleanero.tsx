import { colorCumpleanero } from '../../lib/confeti'

type Tamano = 'sm' | 'md' | 'lg'

const tamanos: Record<Tamano, string> = {
  sm: 'size-8 text-caption',
  md: 'size-11 text-body',
  lg: 'size-14 text-h3',
}

interface AvatarCumpleaneroProps {
  /** _id del beneficiario que viene de la API: define su color confeti. */
  beneficiarioId: string
  nombre: string
  tamano?: Tamano
  /** Cumpleaños que ya pasó en el ciclo: se muestra en gris. */
  pasado?: boolean
}

export function AvatarCumpleanero({
  beneficiarioId,
  nombre,
  tamano = 'md',
  pasado = false,
}: AvatarCumpleaneroProps) {
  const fondo = pasado ? 'bg-no-participa-bg text-no-participa' : `${colorCumpleanero(beneficiarioId).bg} text-tinta`
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold ${tamanos[tamano]} ${fondo}`}
      aria-label={nombre}
      role="img"
    >
      {nombre.charAt(0).toUpperCase()}
    </span>
  )
}
