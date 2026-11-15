package com.colectaapp.backend.aportes;

/**
 * Cuerpos de pedido y respuesta del Módulo 6. Coinciden con frontend/src/types/api.ts
 * (CambioAporte y ResumenColecta).
 */
public final class AportesDtos {

    private AportesDtos() {
    }

    /**
     * PATCH /api/colectas/{id}/aportes/{padreId}. Los dos campos son opcionales:
     * se cambia solo lo que viene (null = no tocar).
     */
    public record CambioAporte(Boolean participa, Boolean pagado) {
    }

    /** GET /api/colectas/{id}/resumen — solo el recaudador. */
    public record ResumenColecta(
            String colectaId,
            double recaudado,
            double montoTotalObjetivo,
            int cantidadParticipan,
            int cantidadPagaron,
            int cantidadPendientes,
            int cantidadSinResponder) {
    }
}
