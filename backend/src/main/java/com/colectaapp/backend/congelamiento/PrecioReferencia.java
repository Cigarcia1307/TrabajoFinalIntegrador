
package com.colectaapp.backend.congelamiento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "precio_referencia")
public class PrecioReferencia {

    @Id
    private String id;

    @Field("colecta_id")
    private String colectaId;

    private String indice;

    private LocalDate fecha;

    @Field("valor_unitario_ars")
    private double valorUnitarioArs;
}
