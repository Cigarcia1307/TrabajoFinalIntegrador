package com.colectaapp.backend.auth.dto;

public record AuthResponse(
        String token,
        String tipo,
        String email,
        String nombre,
        String rol,
        // Id del participante (colección padres). Lo usa el frontend para
        // reconocer al usuario en los aportes y como recaudador (Módulo 6).
        String id
) {
}