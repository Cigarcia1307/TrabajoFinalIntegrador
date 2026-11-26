package com.colectaapp.backend.participantes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Beneficiario {

    private String nombre;

    @Field("fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Field("fecha_nacimiento_solicitada")
    private LocalDate fechaNacimientoSolicitada;

    public Beneficiario(String nombre, LocalDate fechaNacimiento) {
        this(nombre, fechaNacimiento, null);
    }

}