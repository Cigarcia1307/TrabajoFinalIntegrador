
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Cake, Plus } from 'lucide-react'
import { obtenerUsuarioActual } from '../../../services/auth'
import {
    obtenerParticipante,
    agregarBeneficiario,
    solicitarCambioFechaBeneficiario,
} from '../../../services/participantes'
import type { Participante } from '../../../types/api'

export function MisHijosPage() {
    const [participante, setParticipante] = useState<Participante | null>(null)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [nombre, setNombre] = useState('')
    const [fechaNacimiento, setFechaNacimiento] = useState('')
    const [indiceEditando, setIndiceEditando] = useState<number | null>(null)

    useEffect(() => {
        let activo = true

        async function cargarHijos() {
            try {
                const usuario = await obtenerUsuarioActual()
                const datos = await obtenerParticipante(usuario.id)

                if (activo) setParticipante(datos)
            } catch (err) {
                if (activo) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'No se pudieron cargar los hijos.'
                    )
                }
            } finally {
                if (activo) setCargando(false)
            }
        }

        void cargarHijos()

        return () => {
            activo = false
        }
    }, [])
    function editarHijo(indice: number) {
        if (!participante) return

        const hijo = participante.hijos[indice]

        setIndiceEditando(indice)
        setNombre(hijo.nombre)
        setFechaNacimiento(hijo.fechaNacimientoSolicitada ?? hijo.fechaNacimiento)
        setError('')
        setMensaje('')
    }

    async function registrarHijo(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!participante || guardando) return

        setError('')
        setMensaje('')
        setGuardando(true)

        try {
            let actualizado: Participante

            if (indiceEditando !== null) {
                const hijo = participante.hijos[indiceEditando]
                actualizado = await solicitarCambioFechaBeneficiario(
                    participante.id,
                    indiceEditando,
                    fechaNacimiento
                )
                setMensaje(
                    fechaNacimiento === hijo.fechaNacimiento &&
                        hijo.fechaNacimientoSolicitada
                        ? 'La solicitud de cambio fue cancelada.'
                        : fechaNacimiento === hijo.fechaNacimiento
                            ? 'La fecha no tuvo cambios.'
                            : 'Solicitud enviada. Un administrador debe aprobar la nueva fecha.'
                )
            } else {
                actualizado = await agregarBeneficiario(participante.id, {
                    nombre: nombre.trim(),
                    fechaNacimiento,
                })
                setMensaje('¡Hijo registrado correctamente!')
            }

            setParticipante(actualizado)
            setNombre('')
            setFechaNacimiento('')
            setIndiceEditando(null)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'No se pudo registrar el hijo.'
            )
        } finally {
            setGuardando(false)
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
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCE9E3] text-[#D77962]">
                    <Cake size={26} />
                </div>

                <h1 className="text-3xl font-bold text-[#293D3A]">
                    Mis hijos
                </h1>

                <p className="mt-2 text-[#485B58]">
                    Consultá los cumpleaños de tus hijos registrados en nuestra rueda.
                </p>
            </div>

            {cargando && <p>Cargando información...</p>}

            {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">
                    {error}
                </p>
            )}

            {mensaje && (
                <p role="status" className="rounded-xl bg-[#EAF7F5] p-3 text-[#168F87]">
                    {mensaje}
                </p>
            )}

            {!cargando && participante && (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {participante.hijos?.length ? (
                            participante.hijos.map((hijo, indice) => (
                                <article
                                    key={`${hijo.nombre}-${indice}`}
                                    className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm"
                                >
                                    <Cake className="mb-3 text-[#D77962]" size={25} />

                                    <h2 className="text-xl font-bold text-[#293D3A]">
                                        {hijo.nombre}
                                    </h2>

                                    <p className="mt-2 text-[#6B716F]">
                                        Fecha de nacimiento:{' '}
                                        {hijo.fechaNacimiento
                                            ? hijo.fechaNacimiento.split('-').reverse().join('/')
                                            : 'Sin registrar'}
                                    </p>
                                    {hijo.fechaNacimientoSolicitada && (
                                        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                            Cambio solicitado:{' '}
                                            {hijo.fechaNacimientoSolicitada.split('-').reverse().join('/')}
                                            {' · Pendiente de aprobación'}
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => editarHijo(indice)}
                                        className="mt-4 rounded-xl border border-[#168F87] px-4 py-2 font-semibold text-[#168F87] hover:bg-[#EAF7F5]"
                                    >
                                        Editar
                                    </button>
                                </article>
                            ))
                        ) : (
                            <p className="text-[#6B716F]">
                                Todavía no tenés hijos registrados.
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E4F5F4] text-[#168F87]">
                <Plus size={23} />
              </span>

                            <h2 className="text-xl font-bold text-[#293D3A]">
                                {indiceEditando !== null ? 'Solicitar cambio de cumpleaños' : 'Agregar un hijo'}
                            </h2>
                        </div>

                        <form onSubmit={registrarHijo} className="flex flex-col gap-4">
                            {indiceEditando === null ? (
                                <label className="flex flex-col gap-2 font-medium text-[#293D3A]">
                                    Nombre del hijo
                                    <input
                                        type="text"
                                        required
                                        maxLength={100}
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej.: Martina"
                                        className="rounded-xl border border-[#DADFD9] p-3 outline-none focus:border-[#168F87]"
                                    />
                                </label>
                                ) : (
                                    <p className="font-semibold text-[#293D3A]">
                                        {participante.hijos[indiceEditando]?.nombre}
                                    </p>
                                )}

                            <label className="flex flex-col gap-2 font-medium text-[#293D3A]">
                                Fecha de nacimiento
                                <input
                                    type="date"
                                    required
                                    value={fechaNacimiento}
                                    max={new Date().toLocaleDateString('en-CA')}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    className="rounded-xl border border-[#DADFD9] p-3 outline-none focus:border-[#168F87]"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={
                                    guardando ||
                                    (indiceEditando === null && !nombre.trim()) ||
                                    !fechaNacimiento
                                }
                                className="flex w-fit items-center gap-2 rounded-xl bg-[#168F87] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#11766F] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Plus size={18} />
                                {guardando
                                    ? 'Guardando...'
                                    : indiceEditando !== null
                                        ? 'Enviar solicitud'
                                        : 'Registrar hijo'}
                            </button>
                        </form>
                    </div>
                </>
            )}
        </section>
    )
}
