package com.colectaapp.backend.indices.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/**
 * Cuerpos de pedido y de respuesta del Módulo 4. Coinciden con frontend/src/types/api.ts.
 * Están juntos porque son cortos y solo los usa IndiceController.
 */
public final class IndicesDtos {

    private IndicesDtos() {
    }

    /** GET /api/indices — un índice del catálogo. */
    public record IndiceResponse(String id, String nombre, String unidad, String unidadPlural) {
    }

    /** GET /api/indices/vigente — lo elegido para el ciclo (fijo todo el año). */
    public record IndiceVigenteResponse(String votacionId, String indice, double cantidadUnidades,
                                        LocalDate vigenteDesde) {
    }

    /** Una opción de la votación abierta con sus votos hasta ahora. */
    public record ResultadoOpcion(String indice, double cantidadUnidades, int votos) {
    }

    /** GET /api/indices/votacion — la votación abierta vista por quien pregunta (conteos, no quién votó qué). */
    public record VotacionAbiertaResponse(String id, int cicloLectivo, LocalDate fechaApertura, String creadaPor,
                                          List<ResultadoOpcion> opciones, String miVoto, int cantidadVotaron,
                                          int cantidadParticipantes) {
    }

    /** POST /api/indices/votar */
    public record VotoRequest(@NotBlank String indice) {
    }

    /** Una opción al abrir la votación. */
    public record OpcionRequest(@NotBlank String indice, @NotNull @Positive Double cantidadUnidades) {
    }

    /** POST /api/indices/votacion (solo ADMINISTRADOR) */
    public record NuevaVotacionRequest(@NotNull @Size(min = 2) List<@Valid OpcionRequest> opciones) {
    }

    /** POST /api/indices/votacion/cerrar (solo ADMINISTRADOR). desempate solo hace falta si hay empate. */
    public record CierreRequest(String desempate) {
    }

    /** POST /api/indices/{indice}/cotizaciones (solo ADMINISTRADOR). Sin fecha = hoy. */
    public record CargaCotizacionRequest(@NotNull @Positive Double valorUnitarioArs, LocalDate fecha) {
    }
}
