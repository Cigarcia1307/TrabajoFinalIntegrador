package com.colectaapp.backend.indices.cotizaciones;

import java.time.LocalDate;

/**
 * Valor en pesos de UNA unidad de un índice en una fecha.
 * Respuesta de GET /api/indices/{indice}/cotizacion-actual.
 *
 * @param indice           id del índice ("nafta_ypf")
 * @param fecha            fecha del valor
 * @param valorUnitarioArs pesos por unidad (ej. 1 litro = 1490)
 * @param fuente           de dónde salió: "automatica" o "cargada" (por un administrador)
 */
public record Cotizacion(
        String indice,
        LocalDate fecha,
        double valorUnitarioArs,
        String fuente) {

    public static final String AUTOMATICA = "automatica";
    public static final String CARGADA = "cargada";
}
