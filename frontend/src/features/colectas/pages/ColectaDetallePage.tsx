
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { Colecta } from '../../../types/api'
import { obtenerColecta } from '../../../services/colectas'
import { listarParticipantes } from '../../../services/participantes'

export function ColectaDetallePage() {
    const { id } = useParams<{ id: string }>()
    const [colecta, setColecta] = useState<Colecta | null>(null)
    const [nombreRecaudador, setNombreRecaudador] = useState('Sin asignar')
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let vigente = true

        async function cargar() {
            setCargando(true)
            setError('')

            try {
                if (!id) throw new Error('Falta el ID de la colecta')

                const datos = await obtenerColecta(id)
                const participantes = await listarParticipantes()

                const recaudador = participantes.find(
                    p => p.id === datos.recaudadorId
                )

                if (vigente) {
                    setColecta(datos)
                    setNombreRecaudador(
                        recaudador
                            ? `${recaudador.nombre} ${recaudador.apellido}`
                            : 'Sin asignar'
                    )
                }
            } catch {
                if (vigente) {
                    setError('No se pudo cargar la colecta.')
                    setColecta(null)
                }
            } finally {
                if (vigente) setCargando(false)
            }
        }

        void cargar()

        return () => {
            vigente = false
        }
    }, [id])

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Link to="/colectas" className="text-sm underline">
                Volver a colectas
            </Link>

            <h1 className="text-2xl font-bold text-tinta">
                Detalle de la colecta
            </h1>

            {cargando && <p>Cargando colecta...</p>}

            {error && <p role="alert" className="text-red-700">{error}</p>}

            {!cargando && colecta && (
                <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6">
                    <h2 className="text-xl font-semibold">
                        {colecta.beneficiarioNombre}
                    </h2>

                    <p>Ciclo lectivo: {colecta.cicloLectivo}</p>
                    <p>Cumpleaños: {colecta.fechaCumpleanos}</p>
                    <p>Orden en la rueda: {colecta.ordenEnLaRueda}</p>
                    <p>Recaudador: {nombreRecaudador}</p>
                    <p>Estado: {colecta.estadoColecta.replaceAll('_', ' ')}</p>
                    <p>
                        Monto individual: {colecta.montoIndividualPesos.toLocaleString('es-AR', {
                        style: 'currency',
                        currency: 'ARS'
                    })}
                    </p>
                    <p>
                        Objetivo: {colecta.montoTotalObjetivo.toLocaleString('es-AR', {
                        style: 'currency',
                        currency: 'ARS'
                    })}
                    </p>
                </div>
            )}
        </div>
    )
}
