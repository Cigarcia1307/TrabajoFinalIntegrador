import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Boton } from '../../../components/ui'

/** Copia un texto al portapapeles y confirma durante 2 segundos. */
export function BotonCopiar({ texto, etiqueta = 'Copiar' }: { texto: string; etiqueta?: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso de portapapeles: el texto sigue visible para copiarlo a mano.
    }
  }

  return (
    <Boton variante="secundario" onClick={copiar} className="min-h-11 shrink-0 text-caption">
      {copiado ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      <span aria-live="polite">{copiado ? 'Copiado' : etiqueta}</span>
    </Boton>
  )
}
