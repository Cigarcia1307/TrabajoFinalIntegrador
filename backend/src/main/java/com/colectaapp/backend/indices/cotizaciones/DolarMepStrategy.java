package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.Indice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;

/**
 * Dólar MEP: fuente AUTOMÁTICA, una API pública (por defecto dolarapi.com, "dólar bolsa").
 * Si la API no responde, usa el último precio cargado por un administrador.
 */
@Component
public class DolarMepStrategy implements CotizacionStrategy {

    private static final Logger log = LoggerFactory.getLogger(DolarMepStrategy.class);

    private final RestClient restClient = RestClient.create();
    private final CotizacionCargadaService cargadas;
    private final String url;

    public DolarMepStrategy(
            CotizacionCargadaService cargadas,
            @Value("${app.cotizaciones.dolar-mep-url:https://dolarapi.com/v1/dolares/bolsa}") String url) {
        this.cargadas = cargadas;
        this.url = url;
    }

    @Override
    public Indice getIndice() {
        return Indice.DOLAR_MEP;
    }

    @Override
    public Cotizacion obtenerCotizacionActual() {
        try {
            RespuestaDolarApi respuesta = restClient.get().uri(url).retrieve().body(RespuestaDolarApi.class);
            if (respuesta != null && respuesta.venta() != null && respuesta.venta() > 0) {
                return new Cotizacion(getIndice().getId(), fechaDe(respuesta.fechaActualizacion()),
                        respuesta.venta(), Cotizacion.AUTOMATICA);
            }
            log.warn("La API del dólar MEP respondió sin precio de venta");
        } catch (Exception e) {
            log.warn("No se pudo consultar la API del dólar MEP: {}", e.getMessage());
        }
        return cargadas.ultimaObligatoria(getIndice());
    }

    /** "2026-11-14T18:00:00.000Z" → 2026-11-14. Si no se entiende, hoy. */
    private static LocalDate fechaDe(String fechaActualizacion) {
        if (fechaActualizacion == null) {
            return LocalDate.now();
        }
        try {
            return OffsetDateTime.parse(fechaActualizacion).toLocalDate();
        } catch (DateTimeParseException e) {
            return LocalDate.now();
        }
    }

    /** Solo los campos que usamos de la respuesta de la API (el resto se ignora). */
    record RespuestaDolarApi(Double compra, Double venta, String fechaActualizacion) {
    }
}
