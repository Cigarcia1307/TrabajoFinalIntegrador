package com.colectaapp.backend.colectas;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CicloLectivoRepository extends MongoRepository<CicloLectivo, String> {

    Optional<CicloLectivo> findByAnio(int anio);
}