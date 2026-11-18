
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import {
    ArrowLeft,
    CheckCircle2,
    Pencil,
    Save,
    UserRound,
    Wallet,
    X,
} from 'lucide-react'
import { obtenerUsuarioActual } from '../../../services/auth'
import {
    obtenerParticipante,
    actualizarParticipante,
} from '../../../services/participantes'
import type { Participante } from '../../../types/api'

export function MisDatosPage() {
    const [participante, setParticipante] = useState<Participante | null>(null)
    const [telefono, setTelefono] = useState('')
    const [cbuAlias, setCbuAlias] = useState('')
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [editando, setEditando] = useState(false)
    const [confirmando, setConfirmando] = useState(false)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    useEffect(() => {
        let activo = true

        async function cargarDatos() {
            try {
                const usuario = await obtenerUsuarioActual()
                const datos = await obtenerParticipante(usuario.id)

                if (activo) {
                    setParticipante(datos)
                    setTelefono(datos.telefono ?? '')
                    setCbuAlias(datos.cbuAlias ?? '')
                }
            } catch (err) {
                if (activo) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'No se pudieron cargar tus datos.'
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

    function iniciarEdicion() {
        if (!participante) return

        setTelefono(participante.telefono ?? '')
        setCbuAlias(participante.cbuAlias ?? '')
        setError('')
        setMensaje('')
        setEditando(true)
    }

    function cancelarEdicion() {
        if (!participante) return

        setTelefono(participante.telefono ?? '')
        setCbuAlias(participante.cbuAlias ?? '')
        setEditando(false)
        setConfirmando(false)
        setError('')
    }

    function solicitarConfirmacion(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!participante || guardando) return

        setError('')
        setConfirmando(true)
    }

    async function confirmarGuardado() {
        if (!participante || guardando || !confirmando) return

        setGuardando(true)
        setError('')
        setMensaje('')

        try {
            const actualizado = await actualizarParticipante(participante.id, {
                nombre: participante.nombre,
                apellido: participante.apellido,
                email: participante.email,
                telefono: telefono.trim(),
                cbuAlias: cbuAlias.trim(),
                activo: participante.activo,
                hijos: participante.hijos ?? [],
            })

            setParticipante(actualizado)
            setTelefono(actualizado.telefono ?? '')
            setCbuAlias(actualizado.cbuAlias ?? '')
            setConfirmando(false)
            setEditando(false)
            setMensaje('¡Tus datos se actualizaron correctamente!')
        } catch (err) {
            setConfirmando(false)
            setError(
                err instanceof Error
                    ? err.message
                    : 'No se pudieron guardar los cambios.'
            )
        } finally {
            setGuardando(false)
        }
    }

    const hayCambios =
        participante !== null &&
        (telefono.trim() !== (participante.telefono ?? '') ||
            cbuAlias.trim() !== (participante.cbuAlias ?? ''))

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
                    <UserRound size={26} />
                </div>

                <h1 className="text-3xl font-bold text-[#293D3A]">
                    Mis datos
                </h1>

                <p className="mt-2 text-[#485B58]">
                    Consultá tus datos personales y mantené actualizada
                    tu información de contacto y cobro.
                </p>
            </div>

            {cargando && <p>Cargando tus datos...</p>}

            {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
                    {error}
                </p>
            )}

            {mensaje && (
                <div
                    role="status"
                    className="flex items-center gap-3 rounded-xl border border-[#CDE9E5] bg-[#EAF7F5] p-4 text-[#168F87]"
                >
                    <CheckCircle2 size={22} />
                    <p className="font-semibold">{mensaje}</p>
                </div>
            )}

            {!cargando && participante && (
                <>
                    <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-bold text-[#293D3A]">
                            Información personal
                        </h2>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-[#6B716F]">Nombre</p>
                                <p className="mt-1 font-semibold text-[#293D3A]">
                                    {participante.nombre}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-[#6B716F]">Apellido</p>
                                <p className="mt-1 font-semibold text-[#293D3A]">
                                    {participante.apellido}
                                </p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-sm text-[#6B716F]">
                                    Correo electrónico
                                </p>
                                <p className="mt-1 break-all font-semibold text-[#293D3A]">
                                    {participante.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF4D5] text-[#C48C25]">
                <Wallet size={23} />
              </span>
                            <h2 className="text-xl font-bold text-[#293D3A]">
                                Contacto y datos de cobro
                            </h2>
                        </div>

                        {!editando ? (
                            <div className="flex flex-col gap-5">
                                <div>
                                    <p className="text-sm text-[#6B716F]">Teléfono</p>
                                    <p className="mt-1 font-semibold text-[#293D3A]">
                                        {participante.telefono || 'Sin registrar'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-[#6B716F]">CBU o alias</p>
                                    <p className="mt-1 break-all font-semibold text-[#293D3A]">
                                        {participante.cbuAlias || 'Sin registrar'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={iniciarEdicion}
                                    className="flex w-fit items-center gap-2 rounded-xl bg-[#168F87] px-5 py-3 font-semibold text-white hover:bg-[#11766F]"
                                >
                                    <Pencil size={18} />
                                    Editar datos
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={solicitarConfirmacion}
                                className="flex flex-col gap-5"
                            >
                                <label className="flex flex-col gap-2 font-medium text-[#293D3A]">
                                    Teléfono
                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        placeholder="Ej.: 3511234567"
                                        maxLength={30}
                                        disabled={guardando}
                                        className="rounded-xl border border-[#DADFD9] p-3 outline-none focus:border-[#168F87]"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 font-medium text-[#293D3A]">
                                    CBU o alias
                                    <input
                                        type="text"
                                        value={cbuAlias}
                                        onChange={(e) => setCbuAlias(e.target.value)}
                                        placeholder="Ej.: mi.alias.banco"
                                        maxLength={100}
                                        disabled={guardando}
                                        className="rounded-xl border border-[#DADFD9] p-3 outline-none focus:border-[#168F87]"
                                    />
                                </label>

                                <p className="text-sm text-[#6B716F]">
                                    Estos datos se utilizan para comunicarnos con vos
                                    y realizar transferencias cuando te corresponda
                                    recibir una colecta.
                                </p>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="submit"
                                        disabled={!hayCambios || guardando}
                                        className="flex items-center gap-2 rounded-xl bg-[#168F87] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Save size={18} />
                                        Guardar cambios
                                    </button>

                                    <button
                                        type="button"
                                        onClick={cancelarEdicion}
                                        disabled={guardando}
                                        className="flex items-center gap-2 rounded-xl border border-[#DADFD9] px-5 py-3 font-semibold text-[#485B58]"
                                    >
                                        <X size={18} />
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </>
            )}

            {confirmando && participante && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirmar-datos-titulo"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <h2
                            id="confirmar-datos-titulo"
                            className="mb-3 text-xl font-bold text-[#293D3A]"
                        >
                            ¿Confirmás estos cambios?
                        </h2>

                        <p className="mb-5 text-sm text-[#6B716F]">
                            Revisá los datos antes de guardarlos.
                        </p>

                        <div className="mb-6 flex flex-col gap-3 rounded-xl bg-[#F7F8F6] p-4">
                            <div>
                                <p className="text-sm text-[#6B716F]">Teléfono</p>
                                <p className="font-semibold text-[#293D3A]">
                                    {telefono.trim() || 'Sin registrar'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-[#6B716F]">CBU o alias</p>
                                <p className="break-all font-semibold text-[#293D3A]">
                                    {cbuAlias.trim() || 'Sin registrar'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => void confirmarGuardado()}
                                disabled={guardando}
                                className="rounded-xl bg-[#168F87] px-5 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                {guardando ? 'Guardando...' : 'Sí, confirmar'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setConfirmando(false)}
                                disabled={guardando}
                                className="rounded-xl border border-[#DADFD9] px-5 py-3 font-semibold text-[#485B58]"
                            >
                                Volver a editar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
