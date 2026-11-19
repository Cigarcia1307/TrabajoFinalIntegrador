
package com.colectaapp.backend.auth.dto;

public record AuthResponse(
                String token,
                String tipo,
                String id,
                String email,
                String nombre,
                String apellido,
                String rol,
                // Id del participante (colección padres).
                // Lo usa el frontend para reconocer al usuario en los aportes y como
                // recaudador.
                String participanteId) {
}
