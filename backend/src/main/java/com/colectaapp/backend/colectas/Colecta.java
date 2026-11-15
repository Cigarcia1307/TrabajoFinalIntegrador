package com.colectaapp.backend.colectas;

import com.colectaapp.backend.aportes.Aporte;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "colecta_cumpleanos")
public class Colecta {

    @Id
    private String id;

    @Field("ciclo_lectivo")
    private int cicloLectivo;

    @Field("fecha_cumpleanos")
    private LocalDate fechaCumpleanos;

    @Field("monto_individual_pesos")
    private double montoIndividualPesos;

    @Field("monto_total_objetivo")
    private double montoTotalObjetivo;

    @Field("estado_colecta")
    private String estadoColecta;

    private boolean activo;

    @Field("beneficiario_nombre")
    private String beneficiarioNombre;

    @Field("es_primera_voluntaria")
    private boolean esPrimeraVoluntaria;

    @Field("indice_referencia")
    private String indiceReferencia;

    @Field("orden_en_la_rueda")
    private int ordenEnLaRueda;

    @Field("padre_id")
    private String padreId;

    @Field("recaudador_id")
    private String recaudadorId;

    // ── Agregados por el Módulo 6 (Aportes, Eugenia) y el Módulo 4/5 ──────────

    /**
     * Unidades del índice por participante (ej. 5 litros). Se copia de la votación
     * del ciclo al congelar el monto (Módulo 5); null hasta entonces.
     */
    @Field("cantidad_unidades")
    private Double cantidadUnidades;

    /**
     * Aportes embebidos (Módulo 6). @JsonIgnore: NO viajan en GET /api/colectas,
     * porque cada participante solo puede ver su propio aporte (regla de visibilidad).
     * Se consultan por /api/colectas/{id}/aportes, que aplica esa regla.
     */
    @JsonIgnore
    private List<Aporte> aportes = new ArrayList<>();
}