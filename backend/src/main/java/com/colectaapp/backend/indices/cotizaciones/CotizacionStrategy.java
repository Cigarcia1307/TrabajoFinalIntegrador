package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.Indice;

/**
 * Patrón Strategy (Módulo 4): cada índice sabe cómo conseguir su cotización.
 *
 * Cada strategy entrega la cotización más reciente disponible. CotizacionService
 * archiva ese valor con la fecha informada por la fuente y resuelve las consultas
 * históricas exactas sin sustituir fechas faltantes.
 */
public interface CotizacionStrategy {

    /** Índice que resuelve esta strategy. */
    Indice getIndice();

    /**
     * Cotización más reciente disponible.
     *
     * @throws org.springframework.web.server.ResponseStatusException si no hay ningún valor disponible
     */
    Cotizacion obtenerCotizacionActual();
}
