
package com.colectaapp.backend.congelamiento;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PrecioReferenciaRepository
        extends MongoRepository<PrecioReferencia, String> {

    List<PrecioReferencia> findAllByOrderByFechaDesc();

}
