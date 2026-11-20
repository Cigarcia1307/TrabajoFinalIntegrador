package com.colectaapp.backend.indices.cotizaciones;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface CotizacionHistoricaRepository extends MongoRepository<CotizacionHistorica, String> {

    Optional<CotizacionHistorica> findFirstByIndiceAndFecha(String indice, LocalDate fecha);
}
