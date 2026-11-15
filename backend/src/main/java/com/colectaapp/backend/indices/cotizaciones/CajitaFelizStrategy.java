package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.Indice;
import org.springframework.stereotype.Component;

/**
 * Cajita Feliz: fuente MANUAL. No hay una fuente pública de su precio,
 * así que un administrador lo consulta y lo carga en la app.
 */
@Component
public class CajitaFelizStrategy implements CotizacionStrategy {

    private final CotizacionCargadaService cargadas;

    public CajitaFelizStrategy(CotizacionCargadaService cargadas) {
        this.cargadas = cargadas;
    }

    @Override
    public Indice getIndice() {
        return Indice.CAJITA_FELIZ;
    }

    @Override
    public Cotizacion obtenerCotizacionActual() {
        return cargadas.ultimaObligatoria(getIndice());
    }
}
