package com.colectaapp.backend.indices;

import java.util.Arrays;
import java.util.Optional;

/**
 * Catálogo de índices de referencia (Módulo 4).
 *
 * No se guarda en la base: es fijo y lo usa cada CotizacionStrategy.
 * En los documentos de Mongo y en la API el índice viaja como texto ("nafta_ypf"),
 * igual que colecta_cumpleanos.indice_referencia.
 */
public enum Indice {

    NAFTA_YPF("nafta_ypf", "Nafta súper YPF", "litro", "litros"),
    DOLAR_MEP("dolar_mep", "Dólar MEP", "dólar", "dólares"),
    CAJITA_FELIZ("cajita_feliz", "Cajita Feliz", "cajita", "cajitas");

    private final String id;
    private final String nombre;
    private final String unidad;
    private final String unidadPlural;

    Indice(String id, String nombre, String unidad, String unidadPlural) {
        this.id = id;
        this.nombre = nombre;
        this.unidad = unidad;
        this.unidadPlural = unidadPlural;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getUnidad() {
        return unidad;
    }

    public String getUnidadPlural() {
        return unidadPlural;
    }

    /** "nafta_ypf" → NAFTA_YPF. Vacío si el texto no es un índice conocido. */
    public static Optional<Indice> desdeId(String id) {
        return Arrays.stream(values())
                .filter(indice -> indice.id.equals(id))
                .findFirst();
    }
}
