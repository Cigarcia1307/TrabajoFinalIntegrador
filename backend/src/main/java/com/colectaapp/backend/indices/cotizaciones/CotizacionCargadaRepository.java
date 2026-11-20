package com.colectaapp.backend.indices.cotizaciones;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface CotizacionCargadaRepository extends MongoRepository<CotizacionCargada, String> {

    /** El precio más reciente cargado para un índice. */
    Optional<CotizacionCargada> findFirstByIndiceOrderByFechaDesc(String indice);

    Optional<CotizacionCargada> findFirstByIndiceAndFecha(String indice, LocalDate fecha);
}
