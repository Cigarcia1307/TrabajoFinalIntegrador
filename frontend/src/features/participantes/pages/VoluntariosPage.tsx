
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
    ArrowLeft,
    CheckCircle2,
    HandHeart,
    ShieldCheck,
    Users,
    X,
} from 'lucide-react'
import { listarCiclos } from '../../../services/colectas'
import {
    obtenerMiPostulacion,
    postularseVoluntario,
    type PostulacionVoluntario,
} from '../../../services/voluntarios'
import type { CicloLectivo } from '../../../types/api'

export function VoluntariosPage() {
    const [ciclo, setCiclo] = useState<CicloLectivo | null>(null)
    const [cargando, setCargando] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [confirmando, setConfirmando] = useState(false)
    const [postulacion, setPostulacion] =
        useState<PostulacionVoluntario | null>(null)
    const [error, setError] = useState('')
    const [errorPostulacion, setErrorPostulacion] = useState('')

    useEffect(() => {
        let activo = true

        async function cargarDatos() {
            try {
                const ciclos = await listarCiclos()
                if (!activo) return

                const activos = ciclos.filter((c) => c.activo)

                if (activos.length > 1) {
                    setError(
                        'Hay más de un ciclo lectivo activo. Consultá con el administrador.'
                    )
                    return
                }

                if (activos.length === 0) return

                const cicloActivo = activos[0]
                setCiclo(cicloActivo)

                const resultado = await obtenerMiPostulacion(cicloActivo.anio)

                if (activo) {
                    setPostulacion(resultado)
                }
            } catch (err) {
                if (activo) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'No se pudieron consultar los datos.'
                    )
                }
            } finally {
                if (activo) setCargando(false)
            }
        }

        void cargarDatos()

        return () => {
            activo = false
        }
    }, [])

    async function confirmarPostulacion() {
        if (!ciclo || enviando || postulacion) return

        setEnviando(true)
        setErrorPostulacion('')

        try {
            const resultado = await postularseVoluntario(ciclo.anio)
            setPostulacion(resultado)
            setConfirmando(false)
        } catch (err) {
            setConfirmando(false)
            setErrorPostulacion(
                err instanceof Error
                    ? err.message
                    : 'No se pudo registrar la postulación.'
            )
        } finally {
            setEnviando(false)
        }
    }

    return (
        <section className="mx-auto flex max-w-4xl flex-col gap-6">
            <Link
                to="/"
                className="flex w-fit items-center gap-2 text-sm font-semibold text-[#168F87]"
            >
                <ArrowLeft size={18} />
                Volver al inicio
            </Link>

            <div className="rounded-3xl bg-[#EAF7F5] p-7">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#168F87]">
                    <HandHeart size={26} />
                </div>

                <h1 className="text-3xl font-bold text-[#293D3A]">
                    Quiero ser voluntario
                </h1>

                <p className="mt-2 leading-relaxed text-[#485B58]">
                    Cada año necesitamos familias que quieran colaborar
                    con la organización de nuestra rueda de cumpleaños.
                    ¡Tu participación hace la diferencia!
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4D5] text-[#C48C25]">
                        <ShieldCheck size={25} />
                    </div>

                    <h2 className="mb-2 text-xl font-bold text-[#293D3A]">
                        Voluntario titular
                    </h2>

                    <p className="text-sm leading-relaxed text-[#6B716F]">
                        Es la primera persona que se ofrece para colaborar
                        en la organización de las colectas del ciclo lectivo.
                    </p>
                </article>

                <article className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F5F4] text-[#168F87]">
                        <Users size={25} />
                    </div>

                    <h2 className="mb-2 text-xl font-bold text-[#293D3A]">
                        Voluntario suplente
                    </h2>

                    <p className="text-sm leading-relaxed text-[#6B716F]">
                        Es la segunda persona que se ofrece para colaborar
                        y brindar apoyo cuando sea necesario.
                    </p>
                </article>
            </div>

            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-xl font-bold text-[#293D3A]">
                    Mi postulación
                </h2>

                {cargando && (
                    <p className="text-[#6B716F]">
                        Consultando ciclo lectivo y postulación...
                    </p>
                )}

                {error && (
                    <p
                        role="alert"
                        className="mb-4 rounded-xl bg-red-50 p-4 text-red-700"
                    >
                        {error}
                    </p>
                )}

                {!cargando && !ciclo && !error && (
                    <p className="text-[#6B716F]">
                        Todavía no hay un ciclo lectivo activo para postularse.
                    </p>
                )}

                {ciclo && (
                    <p className="mb-5 text-[#485B58]">
                        Ciclo lectivo:{' '}
                        <strong className="text-[#168F87]">
                            {ciclo.anio}
                        </strong>
                    </p>
                )}

                {!cargando && !error && postulacion && (
                    <div
                        role="status"
                        className="rounded-xl border border-[#CDE9E5] bg-[#EAF7F5] p-5"
                    >
                        <div className="mb-2 flex items-center gap-2 text-[#168F87]">
                            <CheckCircle2 size={24} />
                            <h3 className="font-bold">
                                ¡Ya estás registrado como voluntario!
                            </h3>
                        </div>

                        <p className="text-[#485B58]">
                            Tu postulación es como voluntario{' '}
                            <strong>{postulacion.rol}</strong>{' '}
                            para el ciclo lectivo {postulacion.cicloLectivo}.
                        </p>
                    </div>
                )}

                {errorPostulacion && (
                    <p
                        role="alert"
                        className="mb-4 rounded-xl bg-red-50 p-4 text-red-700"
                    >
                        {errorPostulacion}
                    </p>
                )}

                {!cargando && ciclo && !error && !postulacion && (
                    <>
                        <p className="mb-5 text-sm leading-relaxed text-[#6B716F]">
                            Podés ofrecerte como voluntario para este ciclo.
                            El sistema asignará el lugar disponible según
                            el orden de las postulaciones.
                        </p>

                        <button
                            type="button"
                            onClick={() => setConfirmando(true)}
                            disabled={enviando}
                            className="flex w-fit items-center gap-2 rounded-xl bg-[#168F87] px-5 py-3 font-semibold text-white hover:bg-[#11766F] disabled:opacity-50"
                        >
                            <HandHeart size={19} />
                            Quiero postularme
                        </button>
                    </>
                )}
            </div>

            {confirmando && ciclo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-confirmacion-voluntario"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <h2
                            id="titulo-confirmacion-voluntario"
                            className="mb-3 text-xl font-bold text-[#293D3A]"
                        >
                            ¿Confirmás tu postulación?
                        </h2>

                        <p className="mb-5 leading-relaxed text-[#485B58]">
                            Vas a postularte como voluntario para el ciclo
                            lectivo <strong>{ciclo.anio}</strong>.
                            El sistema te asignará el lugar disponible.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => void confirmarPostulacion()}
                                disabled={enviando}
                                className="rounded-xl bg-[#168F87] px-5 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                {enviando ? 'Registrando...' : 'Sí, postularme'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setConfirmando(false)}
                                disabled={enviando}
                                className="flex items-center gap-2 rounded-xl border border-[#DADFD9] px-5 py-3 font-semibold text-[#485B58]"
                            >
                                <X size={18} />
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
