package com.colectaapp.backend.auth;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface InvitacionRepository
        extends MongoRepository<Invitacion, String> {

    Optional<Invitacion> findByToken(String token);

    boolean existsByEmailAndUtilizadaFalse(String email);
}