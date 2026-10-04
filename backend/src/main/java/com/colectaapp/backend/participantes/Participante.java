package com.colectaapp.backend.participantes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "padres")
public class Participante {

    @Id
    private String id;

    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String cbuAlias;
    private boolean activo = true;

    private List<Beneficiario> hijos = new ArrayList<>();
}