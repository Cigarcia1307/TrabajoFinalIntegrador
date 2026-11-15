package com.colectaapp.backend.aportes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

/**
 * Entrada del array `aportes` embebido en cada documento de `colecta_cumpleanos` (Módulo 6).
 * No es una colección propia: vive adentro de la colecta (ver database/esquema_base_datos.md, 2.2).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Aporte {

    /** Quién debe aportar. En la base es un ObjectId (ref → padres). */
    @Field(value = "padre_id", targetType = FieldType.OBJECT_ID)
    private String padreId;

    /** true: participa · false: decidió no participar · null: todavía no respondió. */
    private Boolean participa;

    @Field("monto_pagado")
    private double montoPagado;

    /** "2026-10-08", o null si no pagó. Texto, igual que en los datos ya cargados. */
    @Field("fecha_pago")
    private String fechaPago;

    private boolean pagado;

    /** Aporte nuevo de un participante: todavía no respondió ni pagó. */
    public static Aporte nuevo(String padreId) {
        return new Aporte(padreId, null, 0, null, false);
    }
}
