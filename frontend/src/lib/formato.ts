const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

/** 7450 → "$ 7.450". Usar siempre junto con la clase `tabular-nums`. */
export function formatearARS(monto: number): string {
  return ars.format(monto)
}

const fechaCorta = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' })

/** "2026-07-03" → "03/07" */
export function formatearFechaCorta(fechaISO: string): string {
  return fechaCorta.format(new Date(`${fechaISO}T12:00:00`))
}
