package com.colectaapp.backend.indices.cotizaciones;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;

/**
 * Precio de un índice cargado a mano por un administrador (colección `cotizacion_cargada`).
 *
 * Es la fuente de los índices sin fuente pública (Cajita Feliz) y el respaldo
 * de los automáticos si su fuente falla. No es lo mismo que `precio_referencia`
 * (Módulo 5): eso guarda el valor con el que se CONGELÓ cada colecta.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cotizacion_cargada")
public class CotizacionCargada {

    @Id
    private String id;

    private String indice;

    private LocalDate fecha;

    @Field("valor_unitario_ars")
    private double valorUnitarioArs;

    /** Email del administrador que lo cargó. */
    @Field("cargada_por")
    private String cargadaPor;
}
