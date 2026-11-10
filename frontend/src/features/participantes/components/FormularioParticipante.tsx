
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../../components/ui/Card'
import { Boton } from '../../../components/ui/Boton'
import {
    crearParticipante,
    actualizarParticipante as guardarEdicionParticipante
} from '../../../services/participantes'
import type { Participante } from '../../../types/api'

interface HijoFormulario {
    id: number
    nombre: string
    fechaNacimiento: string
}

const estiloInput =
    'mt-1 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition-colors focus:border-tinta focus:ring-2 focus:ring-tinta/10'

const estiloLabel = 'block text-sm font-medium text-gray-700'

export function FormularioParticipante({
                                           participante
                                       }: {
    participante?: Participante
}) {
    const [datosParticipante, setDatosParticipante] = useState({
        nombre: participante?.nombre ?? '',
        apellido: participante?.apellido ?? '',
        email: participante?.email ?? '',
        telefono: participante?.telefono ?? '',
        cbuAlias: participante?.cbuAlias ?? ''
    })

    const [hijos, setHijos] = useState<HijoFormulario[]>(
        participante?.hijos?.length
            ? participante.hijos.map((hijo, index) => ({
                id: index + 1,
                nombre: hijo.nombre,
                fechaNacimiento: hijo.fechaNacimiento
            }))
            : [{ id: 1, nombre: '', fechaNacimiento: '' }]
    )

    const [hijoAbierto, setHijoAbierto] = useState<number | null>(1)
    const [siguienteId, setSiguienteId] = useState(
        (participante?.hijos?.length ?? 0) + 2
    )
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [error, setError] = useState('')

    const actualizarCampo = (
        campo: keyof typeof datosParticipante,
        valor: string
    ) => {
        setDatosParticipante(anterior => ({
            ...anterior,
            [campo]: valor
        }))
    }

    const agregarHijo = () => {
        const nuevoHijo = {
            id: siguienteId,
            nombre: '',
            fechaNacimiento: ''
        }

        setHijos([...hijos, nuevoHijo])
        setSiguienteId(siguienteId + 1)
        setHijoAbierto(siguienteId)
    }

    const actualizarHijo = (
        id: number,
        campo: 'nombre' | 'fechaNacimiento',
        valor: string
    ) => {
        setHijos(hijos.map(hijo =>
            hijo.id === id
                ? { ...hijo, [campo]: valor }
                : hijo
        ))
    }

    const eliminarHijo = (id: number) => {
        if (hijos.length === 1) return

        setHijos(hijos.filter(hijo => hijo.id !== id))

        if (hijoAbierto === id) {
            setHijoAbierto(null)
        }
    }

    const guardarParticipante = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault()
        setMensaje('')
        setError('')

        const hijoIncompleto = hijos.find(
            hijo => !hijo.nombre.trim() || !hijo.fechaNacimiento
        )

        if (hijoIncompleto) {
            setHijoAbierto(hijoIncompleto.id)
            setError(
                'Completá el nombre y la fecha de nacimiento de cada hijo.'
            )
            return
        }

        setGuardando(true)

        try {
            const datos = {
                nombre: datosParticipante.nombre.trim(),
                apellido: datosParticipante.apellido.trim(),
                email: datosParticipante.email.trim(),
                telefono: datosParticipante.telefono.trim(),
                cbuAlias: datosParticipante.cbuAlias.trim(),
                activo: participante?.activo ?? true,
                hijos: hijos.map(hijo => ({
                    nombre: hijo.nombre.trim(),
                    fechaNacimiento: hijo.fechaNacimiento
                }))
            }

            if (participante) {
                await guardarEdicionParticipante(participante.id, datos)
                setMensaje('Participante actualizado correctamente.')
            } else {
                await crearParticipante(datos)
                setMensaje('Participante registrado correctamente.')

                setDatosParticipante({
                    nombre: '',
                    apellido: '',
                    email: '',
                    telefono: '',
                    cbuAlias: ''
                })

                setHijos([
                    { id: 1, nombre: '', fechaNacimiento: '' }
                ])
                setSiguienteId(2)
                setHijoAbierto(1)
            }
        } catch {
            setError(
                'No se pudo guardar el participante. Intentá nuevamente.'
            )
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Card className="mx-auto max-w-3xl">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-tinta">
                    {participante
                        ? 'Editar participante'
                        : 'Alta de participante'}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    {participante
                        ? 'Modificá los datos y beneficiarios.'
                        : 'Completá tus datos y agregá los hijos que correspondan.'}
                </p>
            </div>

            <form
                className="space-y-8"
                onSubmit={guardarParticipante}
            >
                <section className="space-y-5">
                    <h3 className="border-b pb-3 text-lg font-semibold">
                        Datos del participante
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="nombre" className={estiloLabel}>
                                Nombre
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                className={estiloInput}
                                value={datosParticipante.nombre}
                                onChange={(e) =>
                                    actualizarCampo(
                                        'nombre',
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="apellido" className={estiloLabel}>
                                Apellido
                            </label>
                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                className={estiloInput}
                                value={datosParticipante.apellido}
                                onChange={(e) =>
                                    actualizarCampo(
                                        'apellido',
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className={estiloLabel}>
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={estiloInput}
                            value={datosParticipante.email}
                            onChange={(e) =>
                                actualizarCampo(
                                    'email',
                                    e.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="telefono" className={estiloLabel}>
                                Teléfono
                            </label>
                            <input
                                id="telefono"
                                name="telefono"
                                type="tel"
                                className={estiloInput}
                                value={datosParticipante.telefono}
                                onChange={(e) =>
                                    actualizarCampo(
                                        'telefono',
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="cbuAlias" className={estiloLabel}>
                                CBU o alias
                            </label>
                            <input
                                id="cbuAlias"
                                name="cbuAlias"
                                type="text"
                                className={estiloInput}
                                value={datosParticipante.cbuAlias}
                                onChange={(e) =>
                                    actualizarCampo(
                                        'cbuAlias',
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="text-lg font-semibold">
                            Hijos / beneficiarios
                        </h3>

                        <span className="text-sm text-gray-500">
                            {hijos.length} hijo(s) agregado(s)
                        </span>
                    </div>

                    {hijos.map((hijo, index) => (
                        <div
                            key={hijo.id}
                            className="overflow-hidden rounded-2xl border border-gray-200 transition-colors duration-200 hover:border-tinta/40"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setHijoAbierto(
                                        hijoAbierto === hijo.id
                                            ? null
                                            : hijo.id
                                    )
                                }
                                className="flex w-full items-center justify-between bg-[#FFF9EF] px-5 py-4 text-left font-semibold transition-colors duration-200 hover:bg-[#EDE8DE]"
                                aria-expanded={hijoAbierto === hijo.id}
                                aria-controls={`contenido-hijo-${hijo.id}`}
                            >
                                <span>
                                    Hijo/a {index + 1}
                                    {hijo.nombre && (
                                        <span className="ml-2 font-normal text-gray-500">
                                            — {hijo.nombre}
                                        </span>
                                    )}
                                </span>

                                <span className="text-tinta">
                                    {hijoAbierto === hijo.id ? '−' : '+'}
                                </span>
                            </button>

                            <div
                                id={`contenido-hijo-${hijo.id}`}
                                hidden={hijoAbierto !== hijo.id}
                                className="space-y-4 border-t border-gray-100 px-5 py-5"
                            >
                                <div>
                                    <label
                                        htmlFor={`nombreHijo-${hijo.id}`}
                                        className={estiloLabel}
                                    >
                                        Nombre del hijo/a
                                    </label>

                                    <input
                                        id={`nombreHijo-${hijo.id}`}
                                        type="text"
                                        className={estiloInput}
                                        value={hijo.nombre}
                                        onChange={(e) =>
                                            actualizarHijo(
                                                hijo.id,
                                                'nombre',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor={`fechaHijo-${hijo.id}`}
                                        className={estiloLabel}
                                    >
                                        Fecha de nacimiento
                                    </label>

                                    <input
                                        id={`fechaHijo-${hijo.id}`}
                                        type="date"
                                        className={estiloInput}
                                        value={hijo.fechaNacimiento}
                                        onChange={(e) =>
                                            actualizarHijo(
                                                hijo.id,
                                                'fechaNacimiento',
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                {hijos.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            eliminarHijo(hijo.id)
                                        }
                                        className="text-sm font-medium text-red-600 hover:underline"
                                    >
                                        Eliminar hijo/a
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <Boton
                        type="button"
                        variante="secundario"
                        onClick={agregarHijo}
                    >
                        + Agregar otro hijo
                    </Boton>
                </section>

                {mensaje && (
                    <p
                        role="status"
                        className="rounded-xl bg-green-50 p-4 text-sm text-green-800"
                    >
                        {mensaje}
                    </p>
                )}

                {error && (
                    <p
                        role="alert"
                        className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
                    >
                        {error}
                    </p>
                )}

                <div className="flex justify-end border-t pt-6">
                    <Boton type="submit" disabled={guardando}>
                        {guardando
                            ? 'Guardando...'
                            : participante
                                ? 'Guardar cambios'
                                : 'Guardar participante'}
                    </Boton>
                </div>
            </form>
        </Card>
    )
}
