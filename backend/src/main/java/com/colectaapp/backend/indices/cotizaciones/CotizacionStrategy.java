package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.Indice;

/**
 * Patrón Strategy (Módulo 4): cada índice sabe cómo conseguir su cotización.
 *
 * El resto del sistema (por ejemplo, el congelamiento del Módulo 5) solo pide
 * "dame el valor de hoy" a través de CotizacionService, sin saber si viene de
 * una API, de datos abiertos o de un precio cargado a mano. Cambiar la fuente
 * de un índice es cambiar SU strategy, sin tocar nada más.
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
