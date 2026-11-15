package com.colectaapp.backend.indices.votacion;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VotacionIndiceRepository extends MongoRepository<VotacionIndice, String> {

    Optional<VotacionIndice> findByCicloLectivo(int cicloLectivo);
}
