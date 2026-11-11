package com.colectaapp.backend.auth;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
public class InvitacionService {

    private final InvitacionRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();

    public InvitacionService(InvitacionRepository repository) {
        this.repository = repository;
    }

    public Invitacion crearInvitacion(String email, String creadaPor) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "El email es obligatorio."
            );
        }

        if (repository.existsByEmailAndUtilizadaFalse(email)) {
            throw new IllegalArgumentException(
                    "Ya existe una invitación pendiente para ese email."
            );
        }

        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);

        Invitacion invitacion = new Invitacion();
        invitacion.setEmail(email.trim().toLowerCase());
        invitacion.setToken(token);
        invitacion.setFechaExpiracion(
                Instant.now().plus(7, ChronoUnit.DAYS)
        );
        invitacion.setUtilizada(false);
        invitacion.setCreadaPor(creadaPor);

        return repository.save(invitacion);
    }

    public Invitacion validarInvitacion(String token) {
        Invitacion invitacion = repository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La invitación no existe."
                ));

        if (invitacion.isUtilizada()) {
            throw new IllegalArgumentException(
                    "La invitación ya fue utilizada."
            );
        }

        if (invitacion.getFechaExpiracion() == null
                || !invitacion.getFechaExpiracion().isAfter(Instant.now())) {
            throw new IllegalArgumentException(
                    "La invitación venció."
            );
        }

        return invitacion;
    }
}