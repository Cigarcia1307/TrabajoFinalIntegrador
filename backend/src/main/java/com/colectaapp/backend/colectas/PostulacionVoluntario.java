
package com.colectaapp.backend.colectas;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "postulaciones_voluntarios")
@CompoundIndex(
        name = "ciclo_rol_unico",
        def = "{'cicloLectivo': 1, 'rol': 1}",
        unique = true
)
public class PostulacionVoluntario {

    @Id
    private String id;

    private int cicloLectivo;
    private String participanteId;
    private String rol;
    private LocalDateTime fechaPostulacion;
}
