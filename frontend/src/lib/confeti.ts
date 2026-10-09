/**
 * Asigna a cada cumpleañero un color "confeti" estable.
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
 * El color de cada cumpleañero sale de su lugar en la rueda (colecta.ordenEnLaRueda):
 * 1 → mostaza, 2 → turquesa, 3 → coral, 4 → lila, 5 → cielo, 6 → mostaza…
 * Así dos cumpleaños consecutivos nunca comparten color, y cada chico
 * conserva el suyo durante todo el ciclo, en todas las pantallas.
 */
export function colorCumpleanero(ordenEnLaRueda: number): ColorConfeti {
  const posicion = Math.max(ordenEnLaRueda, 1) - 1;
  return CONFETI[posicion % CONFETI.length];
}
