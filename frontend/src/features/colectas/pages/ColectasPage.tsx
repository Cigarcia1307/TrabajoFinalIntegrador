
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Cake, CalendarDays, Users, CircleDollarSign } from 'lucide-react'
import type { Colecta, Participante } from '../../../types/api'
import { listarColectas } from '../../../services/colectas'
import { listarParticipantes } from '../../../services/participantes'

const coloresTarjetas = [
  'bg-[#EAF7F5]',
  'bg-[#FFF0E9]',
  'bg-[#F4F0FF]',
  'bg-[#FFF8DF]',
]

export function ColectasPage() {
  const [anio, setAnio] = useState(() => {
    const cicloGuardado = sessionStorage.getItem('cicloColectas')
    const ciclo = cicloGuardado ? Number(cicloGuardado) : NaN

    return Number.isInteger(ciclo) && ciclo >= 2000 && ciclo <= 2100
        ? ciclo
        : new Date().getFullYear()
  })

  const [colectas, setColectas] = useState<Colecta[]>([])
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    sessionStorage.setItem('cicloColectas', String(anio))
  }, [anio])

  useEffect(() => {
    let vigente = true

    async function cargar() {
      setCargando(true)
      setError('')

      try {
        const [datosColectas, datosParticipantes] = await Promise.all([
          listarColectas(anio),
          listarParticipantes(),
        ])

        if (vigente) {
          setColectas(datosColectas)
          setParticipantes(datosParticipantes)
        }
      } catch {
        if (vigente) {
          setError('No se pudieron cargar las colectas.')
          setColectas([])
        }
      } finally {
        if (vigente) setCargando(false)
      }
    }

    void cargar()

    return () => {
      vigente = false
    }
  }, [anio])

  const obtenerNombreRecaudador = (id: string) => {
    if (!id) return 'Sin asignar'

    const participante = participantes.find((p) => p.id === id)

    return participante
        ? `${participante.nombre} ${participante.apellido}`
        : 'Recaudador no encontrado'
  }

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Sin fecha'

    const partes = fecha.split('-')
    if (partes.length !== 3) return fecha

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  const formatearMonto = (monto: number) =>
      new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }).format(monto ?? 0)

  const colectasOrdenadas = [...colectas].sort(
      (a, b) => a.ordenEnLaRueda - b.ordenEnLaRueda
  )

  return (
      <section className="mx-auto flex max-w-5xl flex-col gap-7">

        {/* ENCABEZADO */}
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-[#EAF7F5] p-7">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCE9E3] text-[#D77962]">
              <Cake size={26} />
            </div>

            <h1 className="text-3xl font-bold text-[#293D3A]">
              Colectas
            </h1>

            <p className="mt-2 text-[#485B58]">
              Cumpleaños y recaudadores del ciclo lectivo.
            </p>
          </div>

          <div>
            <label
                htmlFor="ciclo"
                className="mb-2 block text-sm font-semibold text-[#293D3A]"
            >
              Ciclo lectivo
            </label>

            <input
                id="ciclo"
                type="number"
                min="2000"
                max="2100"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                className="w-32 rounded-xl border border-[#C7DDD9] bg-white px-4 py-3 text-[#293D3A] outline-none focus:border-[#168F87]"
            />
          </div>
        </div>

        {cargando && (
            <p className="text-[#485B58]">Cargando colectas...</p>
        )}

        {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
              {error}
            </p>
        )}

        {!cargando && !error && colectas.length === 0 && (
            <div className="rounded-2xl border border-[#E8E6DF] bg-[#FFF8DF] p-6">
              <p className="font-semibold text-[#293D3A]">
                No hay colectas registradas para {anio}.
              </p>
              <p className="mt-2 text-sm text-[#485B58]">
                Cuando se generen las colectas del ciclo,
                aparecerán en esta pantalla.
              </p>
            </div>
        )}

        {!cargando && !error && colectas.length > 0 && (
            <>
              {/* LISTADO */}
              <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FCE9E3] text-[#D77962]">
              <CalendarDays size={22} />
            </span>

                <div>
                  <h2 className="text-xl font-bold text-[#293D3A]">
                    Cumpleaños del ciclo
                  </h2>
                  <p className="text-sm text-[#6B716F]">
                    {colectas.length} colecta(s) registradas en {anio}.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {colectasOrdenadas.map((colecta, indice) => (
                    <Link
                        key={colecta.id}
                        to={`/colectas/${colecta.id}`}
                        className={`group relative block overflow-hidden rounded-3xl border border-[#E8E6DF] p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#168F87] hover:shadow-md ${coloresTarjetas[indice % coloresTarjetas.length]}`}
                    >
                      {/* Círculo decorativo */}
                      <div className="pointer-events-none absolute -right-9 -top-12 h-36 w-36 rounded-full bg-white/40" />

                      <div className="relative">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-[#6B716F]">
                        Colecta #{colecta.ordenEnLaRueda}
                      </span>

                            <h3 className="mt-2 text-2xl font-bold text-[#293D3A]">
                              {colecta.beneficiarioNombre}
                            </h3>
                          </div>

                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#168F87]">
                      {colecta.estadoColecta.replaceAll('_', ' ')}
                    </span>
                        </div>

                        <div className="space-y-3 text-sm text-[#485B58]">
                          <div className="flex items-center gap-2">
                            <Cake size={17} className="text-[#D77962]" />
                            <span>
                        Cumpleaños: {formatearFecha(colecta.fechaCumpleanos)}
                      </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users size={17} className="text-[#168F87]" />
                            <span>
                        Recaudador: {obtenerNombreRecaudador(colecta.recaudadorId)}
                      </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <CircleDollarSign size={17} className="text-[#168F87]" />
                            <span>
                        Monto individual: {formatearMonto(colecta.montoIndividualPesos)}
                      </span>
                          </div>

                          <p className="border-t border-[#293D3A]/10 pt-3 font-semibold text-[#293D3A]">
                            Objetivo: {formatearMonto(colecta.montoTotalObjetivo)}
                          </p>
                        </div>

                        <p className="mt-4 text-sm font-semibold text-[#168F87]">
                          Ver detalle →
                        </p>
                      </div>
                    </Link>
                ))}
              </div>

              {/* RUEDA CIRCULAR */}
              <div className="rounded-3xl border border-[#E8E6DF] bg-[#FFFDF9] p-5 shadow-sm sm:p-8">
                <div className="mb-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F5F4] text-[#168F87]">
                <Users size={24} />
              </span>

                  <div>
                    <h2 className="text-xl font-bold text-[#293D3A]">
                      Nuestra rueda de cumpleaños
                    </h2>
                    <p className="text-sm text-[#6B716F]">
                      Orden de las colectas del ciclo {anio}.
                    </p>
                  </div>
                </div>

                <div className="relative mx-auto aspect-square w-full max-w-[520px]">
                  {/* Círculo de la rueda */}
                  <div className="absolute inset-[12%] rounded-full border-[12px] border-[#E4F5F4] bg-[#F7FCFB]" />

                  {/* Centro */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#168F87] text-center text-white shadow-md sm:h-32 sm:w-32">
                    <Cake size={25} />
                    <span className="mt-1 text-xs font-bold sm:text-sm">
                  Rueda {anio}
                </span>
                  </div>

                  {colectasOrdenadas.map((colecta, indice) => {
                    const angulo =
                        (indice / colectasOrdenadas.length) * 2 * Math.PI -
                        Math.PI / 2

                    const x = 50 + 37 * Math.cos(angulo)
                    const y = 50 + 37 * Math.sin(angulo)

                    return (
                        <Link
                            key={colecta.id}
                            to={`/colectas/${colecta.id}`}
                            title={`Colecta ${colecta.ordenEnLaRueda}: ${colecta.beneficiarioNombre}`}
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                            }}
                            className="absolute z-20 flex h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-white bg-[#FCE9E3] p-1 text-center shadow-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#168F87]"
                        >
                    <span className="text-xs font-bold text-[#D77962]">
                      #{colecta.ordenEnLaRueda}
                    </span>
                          <span className="mt-1 w-full truncate px-1 text-xs font-bold text-[#293D3A] sm:text-sm">
                      {colecta.beneficiarioNombre}
                    </span>
                        </Link>
                    )
                  })}
                </div>

                <p className="mt-4 text-center text-sm text-[#6B716F]">
                  Seleccioná un cumpleaños para ver su colecta.
                </p>
              </div>
            </>
        )}
      </section>
  )
}
