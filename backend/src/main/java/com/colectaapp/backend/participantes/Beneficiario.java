package com.colectaapp.backend.participantes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Beneficiario {

    private String nombre;
    private LocalDate fechaNacimiento;
}