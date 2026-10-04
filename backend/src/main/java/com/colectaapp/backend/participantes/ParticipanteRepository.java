package com.colectaapp.backend.participantes;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipanteRepository extends MongoRepository<Participante, String> {

    Optional<Participante> findByEmail(String email);

    List<Participante> findByActivoTrue();
}