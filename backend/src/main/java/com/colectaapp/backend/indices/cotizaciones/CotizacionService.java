package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.Indice;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Punto de entrada a las cotizaciones (Módulo 4).
 *
 * Spring inyecta TODAS las clases que implementan CotizacionStrategy; acá se
 * ordenan por índice. Quien necesite un valor (el controller, o el congelamiento
 * del Módulo 5) llama a obtenerCotizacionActual(indice) sin saber de dónde sale.
 */
@Service
public class CotizacionService {

    private final Map<Indice, CotizacionStrategy> strategies = new EnumMap<>(Indice.class);

    public CotizacionService(List<CotizacionStrategy> todas) {
        for (CotizacionStrategy strategy : todas) {
            strategies.put(strategy.getIndice(), strategy);
        }
        for (Indice indice : Indice.values()) {
            if (!strategies.containsKey(indice)) {
                throw new IllegalStateException("Falta la CotizacionStrategy de " + indice);
            }
        }
    }

    public Cotizacion obtenerCotizacionActual(Indice indice) {
        return strategies.get(indice).obtenerCotizacionActual();
    }
}
