/**
 * Asigna a cada cumpleañero (beneficiario) un color "confeti" estable.
 *
 * IMPORTANTE (Tailwind): las clases tienen que aparecer COMPLETAS en el código.
 * Tailwind escanea el texto de los archivos; si armás la clase con un template
 * string (`bg-confeti-${color}`), no la genera y el color no aparece.
 * Por eso el mapa de abajo tiene las clases escritas enteras.
 */

export const CONFETI = [
  { nombre: "mostaza",  bg: "bg-confeti-mostaza",  borde: "border-confeti-mostaza"  },
  { nombre: "turquesa", bg: "bg-confeti-turquesa", borde: "border-confeti-turquesa" },
  { nombre: "coral",    bg: "bg-confeti-coral",    borde: "border-confeti-coral"    },
  { nombre: "lila",     bg: "bg-confeti-lila",     borde: "border-confeti-lila"     },
  { nombre: "cielo",    bg: "bg-confeti-cielo",    borde: "border-confeti-cielo"    },
] as const;

export type ColorConfeti = (typeof CONFETI)[number];

/**
 * Mismo id → mismo color, siempre (en cualquier pantalla y para cualquier usuario).
 * Recibe el _id del beneficiario que viene de la API.
 */
export function colorCumpleanero(beneficiarioId: string): ColorConfeti {
  let hash = 0;
  for (let i = 0; i < beneficiarioId.length; i++) {
    hash = (hash * 31 + beneficiarioId.charCodeAt(i)) >>> 0;
  }
  return CONFETI[hash % CONFETI.length];
}
