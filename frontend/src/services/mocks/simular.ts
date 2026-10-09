/**
 * Simula la red: una demora corta y una COPIA del dato, para que una pantalla
 * que modifique lo que recibe no altere los datos de prueba por accidente.
 */
export async function responder<T>(dato: T, demoraMs = 250): Promise<T> {
  await new Promise((resolver) => setTimeout(resolver, demoraMs))
  return structuredClone(dato)
}
