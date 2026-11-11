
import { createBrowserRouter } from 'react-router'
import { MisAportesPage } from '../features/aportes/pages/MisAportesPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RutaProtegida } from '../features/auth/components/RutaProtegida'
import { ColectasPage } from '../features/colectas/pages/ColectasPage'
import { InicioPage } from '../features/colectas/pages/InicioPage'
import { IndicePage } from '../features/indices/pages/IndicePage'
import { GrupoPage } from '../features/participantes/pages/GrupoPage'
import { PerfilPage } from '../features/participantes/pages/PerfilPage'
import { AppLayout } from './AppLayout'
import { ErrorPage } from './ErrorPage'
import { GuiaDisenoPage } from './GuiaDisenoPage'
import { RegistroPage } from '../features/auth/pages/RegistroPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/registro',
    element: <RegistroPage />,
  },
  {
    
    element: <RutaProtegida />,
    children: [
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
          { path: 'diseno', element: <GuiaDisenoPage /> },
        ],
      },
    ],
  },
])
