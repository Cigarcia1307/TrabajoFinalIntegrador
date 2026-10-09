import { createBrowserRouter } from 'react-router'
import { MisAportesPage } from '../features/aportes/pages/MisAportesPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ColectasPage } from '../features/colectas/pages/ColectasPage'
import { InicioPage } from '../features/colectas/pages/InicioPage'
import { IndicePage } from '../features/indices/pages/IndicePage'
import { GrupoPage } from '../features/participantes/pages/GrupoPage'
import { PerfilPage } from '../features/participantes/pages/PerfilPage'
import { AppLayout } from './AppLayout'
import { ErrorPage } from './ErrorPage'
import { GuiaDisenoPage } from './GuiaDisenoPage'

/**
 * Mapa de rutas de la app. Cada pantalla vive en la carpeta de su módulo
 * (src/features/<modulo>/pages) y se registra acá.
 */
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <InicioPage /> },
      { path: 'colectas', element: <ColectasPage /> },
      { path: 'grupo', element: <GrupoPage /> },
      { path: 'perfil', element: <PerfilPage /> },
      { path: 'aportes', element: <MisAportesPage /> },
      { path: 'indice', element: <IndicePage /> },
      // Guía viva del sistema de diseño: para revisar componentes y tokens.
      { path: 'diseno', element: <GuiaDisenoPage /> },
    ],
  },
])
