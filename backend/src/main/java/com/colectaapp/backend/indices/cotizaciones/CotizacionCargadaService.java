package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.Indice;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

/** Precios cargados a mano por un administrador. */
@Service
public class CotizacionCargadaService {

    private final CotizacionCargadaRepository repository;

    public CotizacionCargadaService(CotizacionCargadaRepository repository) {
        this.repository = repository;
    }

    /** Último precio cargado para el índice, si hay alguno. */
    public Optional<Cotizacion> ultima(Indice indice) {
        return repository.findFirstByIndiceOrderByFechaDesc(indice.getId())
                .map(c -> new Cotizacion(
                        c.getIndice(),
                        c.getFecha(),
                        c.getValorUnitarioArs(),
                        Cotizacion.CARGADA));
    }

    /** Último precio cargado, o 503 si nunca se cargó ninguno. */
    public Cotizacion ultimaObligatoria(Indice indice) {
        return ultima(indice).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "No hay cotización disponible para " + indice.getNombre()
                        + ": un administrador tiene que cargar el precio"));
    }

    /** Guarda un precio nuevo. Si no viene fecha, se usa la de hoy. */
    public Cotizacion cargar(Indice indice, double valorUnitarioArs, LocalDate fecha, String emailAdministrador) {
        if (valorUnitarioArs <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El precio tiene que ser mayor a 0");
        }
        LocalDate dia = fecha != null ? fecha : LocalDate.now();
        if (dia.isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha no puede ser futura");
        }

        CotizacionCargada guardada = repository.save(
                new CotizacionCargada(null, indice.getId(), dia, valorUnitarioArs, emailAdministrador));

        return new Cotizacion(guardada.getIndice(), guardada.getFecha(),
                guardada.getValorUnitarioArs(), Cotizacion.CARGADA);
    }
}
