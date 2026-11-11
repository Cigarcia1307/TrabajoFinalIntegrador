package com.colectaapp.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InvitacionRequest(

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        String email

) {
}