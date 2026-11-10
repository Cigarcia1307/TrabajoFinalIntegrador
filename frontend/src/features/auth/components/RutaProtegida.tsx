
import { Navigate, Outlet } from 'react-router'
import { useEffect, useState } from 'react'
import { obtenerUsuarioActual } from '../../../services/auth'

export function RutaProtegida() {
  const [estado, setEstado] = useState<'cargando' | 'autenticado' | 'no-autenticado'>('cargando')

  useEffect(() => {
    obtenerUsuarioActual()
      .then(() => setEstado('autenticado'))
      .catch(() => setEstado('no-autenticado'))
  }, [])

  if (estado === 'cargando') {
    return <p className="p-8 text-center">Verificando sesión...</p>
  }

  if (estado === 'no-autenticado') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
