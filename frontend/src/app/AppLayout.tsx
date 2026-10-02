import { CalendarDays, House, UserRound, Users, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { LogoRueda } from '../components/marca/LogoRueda'

const secciones: { a: string; etiqueta: string; Icono: LucideIcon }[] = [
  { a: '/', etiqueta: 'Inicio', Icono: House },
  { a: '/colectas', etiqueta: 'Colectas', Icono: CalendarDays },
  { a: '/grupo', etiqueta: 'Grupo', Icono: Users },
  { a: '/perfil', etiqueta: 'Perfil', Icono: UserRound },
]

/**
 * Estructura común a todas las pantallas con sesión iniciada.
 * Mobile: encabezado arriba + navegación fija abajo.
 * Escritorio (md: 768px+): barra lateral a la izquierda.
 */
export function AppLayout() {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-borde bg-superficie px-5 py-7 md:flex md:flex-col md:gap-8">
        <LogoRueda />
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {secciones.map(({ a, etiqueta, Icono }) => (
            <NavLink
              key={a}
              to={a}
              end={a === '/'}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-full px-4 font-semibold ${
                  isActive ? 'bg-tinta text-white' : 'text-tinta hover:bg-tinta/5'
                }`
              }
            >
              <Icono size={20} aria-hidden />
              {etiqueta}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
          <LogoRueda />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-28 pt-4 md:px-12 md:pb-12 md:pt-10">
          <Outlet />
        </main>

        <nav
          aria-label="Principal"
          className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-borde bg-superficie px-2 pb-4 pt-2 md:hidden"
        >
          {secciones.map(({ a, etiqueta, Icono }) => (
            <NavLink
              key={a}
              to={a}
              end={a === '/'}
              className={({ isActive }) =>
                `flex min-h-12 flex-col items-center justify-center gap-0.5 text-caption ${
                  isActive ? 'font-extrabold text-tinta' : 'font-semibold text-texto-suave'
                }`
              }
            >
              <Icono size={22} aria-hidden />
              {etiqueta}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
