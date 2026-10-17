package com.colectaapp.backend.auth.dto;

public record AuthResponse(
        String token,
        String tipo,
        String email,
        String nombre,
        String rol
) {
}