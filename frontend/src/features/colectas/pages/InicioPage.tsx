
import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { obtenerUsuarioActual } from '../../../services/auth'
import {
  ArrowRight,
  Cake,
  Gift,
  HandHeart,
  Heart,
  UserRound,
} from 'lucide-react'
import { LogoRueda } from '../../../components/marca/LogoRueda'

export function InicioPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    obtenerUsuarioActual()
        .then((usuario) => setNombre(usuario.nombre))
        .catch((error) => {
          console.error('No se pudo cargar el usuario:', error)
        })
  }, [])

  const secciones = [
    {
      titulo: 'Mis hijos',
      descripcion: 'Registrá a tus hijos y sus fechas de cumpleaños.',
      Icono: Cake,
      ruta: '/mis-hijos',
      boton: 'Registrar o consultar',
      fondoIcono: 'bg-[#FCE9E3]',
      colorIcono: 'text-[#D77962]',
    },
    {
      titulo: 'Mis datos',
      descripcion: 'Consultá o modificá tus datos, teléfono y CBU o alias.',
      Icono: UserRound,
      ruta: '/mis-datos',
      boton: 'Ver mis datos',
      fondoIcono: 'bg-[#E4F5F4]',
      colorIcono: 'text-[#168F87]',
    },
    {
      titulo: 'Mis aportes',
      descripcion: 'Consultá tus aportes y pagos de cumpleaños.',
      Icono: Gift,
      ruta: '/aportes',
      boton: 'Ver mis aportes',
      fondoIcono: 'bg-[#FFF4D5]',
      colorIcono: 'text-[#C48C25]',
    },
    {
      titulo: 'Quiero ser voluntario',
      descripcion: 'Colaborá en la organización de las colectas.',
      Icono: HandHeart,
      ruta: '/voluntarios',
      boton: 'Quiero participar',
      fondoIcono: 'bg-[#E4F5F4]',
      colorIcono: 'text-[#168F87]',
    },
  ]

  return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 md:p-8">

        {/* Bienvenida */}
        <section className="relative overflow-hidden rounded-3xl border border-[#CDE9E5] bg-[#EAF7F5] p-7 shadow-sm md:p-10">

          <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#CBECE7] opacity-70"
          />

          <div
              aria-hidden="true"
              className="absolute -bottom-16 right-28 h-36 w-36 rounded-full bg-[#FFF1CB] opacity-80"
          />

          <div className="relative flex flex-col items-center gap-8 md:flex-row md:gap-10">

            {/* Texto de bienvenida */}
            <div className="flex-1">
              <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#D77962] shadow-sm">
                <Heart size={23} />
              </span>

                <span className="text-xs font-bold tracking-wider text-[#168F87]">
                NUESTRA RUEDA DE CUMPLEAÑOS
              </span>
              </div>

              <h1 className="mb-4 text-3xl font-bold text-[#293D3A] md:text-4xl">
                {nombre ? `¡Hola, ${nombre}!` : '¡Bienvenido a ColectaApp!'}
              </h1>

              <p className="mb-4 text-lg font-semibold text-[#168F87]">
                ¡Qué bueno que seas parte de nuestra rueda!
              </p>

              <p className="max-w-2xl leading-relaxed text-[#485B58]">
                En ColectaApp, las familias nos organizamos para que
                cada chico reciba su regalo cuando llegue su cumpleaños.
                Entre todos hacemos que la rueda siga girando y que
                nadie se quede afuera.
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#168F87]">
                <Heart size={16} />
                Cada cumpleaños cuenta
              </div>
            </div>

            {/* Logo original de ColectaApp */}
            <div className="flex shrink-0 items-center justify-center">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white bg-white/70 shadow-sm md:h-44 md:w-44">
                <div className="scale-[3]">
                  <LogoRueda conNombre={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Secciones principales */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-[#293D3A]">
            Mi participación
          </h2>

          <p className="mb-6 text-[#6B716F]">
            Elegí qué querés hacer para participar en nuestra rueda.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {secciones.map((seccion) => (
                <article
                    key={seccion.titulo}
                    className="flex flex-col rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm transition-all hover:border-[#B7DED9] hover:shadow-md"
                >
                  <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${seccion.fondoIcono}`}
                  >
                    <seccion.Icono
                        size={25}
                        className={seccion.colorIcono}
                        aria-hidden="true"
                    />
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-[#293D3A]">
                    {seccion.titulo}
                  </h3>

                  <p className="mb-6 flex-1 text-sm leading-relaxed text-[#6B716F]">
                    {seccion.descripcion}
                  </p>

                  <button
                      type="button"
                      onClick={() => navigate(seccion.ruta)}
                      className="flex w-fit items-center gap-2 rounded-xl bg-[#168F87] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#11766F]"
                  >
                    {seccion.boton}
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </article>
            ))}
          </div>
        </section>
      </div>
  )
}
