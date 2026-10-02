import { TriangleAlert } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function ErrorPage() {
  const error = useRouteError()
  const noEncontrada = isRouteErrorResponse(error) && error.status === 404

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
      <TriangleAlert size={40} className="text-error" aria-hidden />
      <h1 className="text-h2 font-extrabold">
        {noEncontrada ? 'Esta página no existe' : 'Algo salió mal'}
      </h1>
      <Link to="/" className="font-bold underline underline-offset-4">
        Volver al inicio
      </Link>
    </main>
  )
}
