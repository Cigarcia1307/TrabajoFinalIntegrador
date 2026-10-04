package com.colectaapp.backend.colectas;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ciclos_lectivos")
public class CicloLectivo {

    @Id
    private String id;

    private int anio;
    private boolean activo = true;
}