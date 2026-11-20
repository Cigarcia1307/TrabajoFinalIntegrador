package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.Indice;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Punto de entrada a las cotizaciones (Módulo 4).
 *
 * Spring inyecta TODAS las clases que implementan CotizacionStrategy; acá se
 * ordenan por índice. Los consumidores consultan el valor actual o una fecha
 * histórica exacta sin conocer la fuente que lo produjo.
 */
@Service
public class CotizacionService {

    private final Map<Indice, CotizacionStrategy> strategies = new EnumMap<>(Indice.class);
    private final CotizacionCargadaService cargadas;
    private final CotizacionHistoricaRepository historicas;

    public CotizacionService(
            List<CotizacionStrategy> todas,
            CotizacionCargadaService cargadas,
            CotizacionHistoricaRepository historicas) {
        this.cargadas = cargadas;
        this.historicas = historicas;
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

    /**
     * Busca un dato real archivado o cargado manualmente para esa fecha exacta.
     * Nunca sustituye una fecha faltante por la cotización actual o la más reciente.
     */
    public Cotizacion obtenerCotizacionHistorica(Indice indice, LocalDate fecha) {
        return cargadas.enFecha(indice, fecha)
                .or(() -> historicas.findFirstByIndiceAndFecha(indice.getId(), fecha)
                        .map(c -> new Cotizacion(c.getIndice(), c.getFecha(),
                                c.getValorUnitarioArs(), c.getFuente())))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "No hay cotización histórica para " + indice.getNombre() + " en " + fecha));
    }

    /**
     * Archiva la cotización auténtica que devuelve la fuente, conservando su fecha.
     * Una cotización con fecha distinta no se reetiqueta como si fuera de hoy.
     */
    public void archivarCotizacionDisponible(Indice indice, LocalDate hoy) {
        Cotizacion cotizacion = obtenerCotizacionActual(indice);
        if (cotizacion == null
                || !indice.getId().equals(cotizacion.indice())
                || cotizacion.fecha() == null
                || cotizacion.fecha().isAfter(hoy)
                || cotizacion.valorUnitarioArs() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "La fuente no devolvió una cotización válida para " + indice.getNombre());
        }

        if (historicas.findFirstByIndiceAndFecha(indice.getId(), cotizacion.fecha()).isPresent()) {
            return;
        }

        try {
            historicas.save(new CotizacionHistorica(
                    null, cotizacion.indice(), cotizacion.fecha(),
                    cotizacion.valorUnitarioArs(), cotizacion.fuente()));
        } catch (DuplicateKeyException e) {
            if (historicas.findFirstByIndiceAndFecha(indice.getId(), cotizacion.fecha()).isEmpty()) {
                throw e;
            }
        }
    }
}
