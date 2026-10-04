package com.colectaapp.backend.colectas;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ColectaRepository extends MongoRepository<Colecta, String> {

    List<Colecta> findByCicloLectivo(int cicloLectivo);

    boolean existsByCicloLectivo(int cicloLectivo);
}