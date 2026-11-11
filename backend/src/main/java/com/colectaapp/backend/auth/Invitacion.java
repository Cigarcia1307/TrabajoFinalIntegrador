package com.colectaapp.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invitaciones")
public class Invitacion {

    @Id
    private String id;

    private String email;
    private String token;
    private Instant fechaExpiracion;
    private boolean utilizada;
    private String creadaPor;
}