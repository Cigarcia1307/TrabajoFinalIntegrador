package com.colectaapp.backend.indices.votacion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Votación del índice y de la cantidad de unidades (colección `votacion_indice`).
 *
 * Hay UNA sola por ciclo lectivo y su resultado no cambia durante el año
 * (ver database/esquema_base_datos.md, sección 2.4 y regla en la sección 4).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "votacion_indice")
public class VotacionIndice {

    public static final String ABIERTA = "abierta";
    public static final String CERRADA = "cerrada";

    @Id
    private String id;

    /** Único: garantiza una sola votación por ciclo. */
    @Indexed(unique = true)
    @Field("ciclo_lectivo")
    private int cicloLectivo;

    /** "abierta" o "cerrada". */
    private String estado;

    /** Id del administrador (padres) que la abrió. */
    @Field("creada_por")
    private String creadaPor;

    @Field("fecha_apertura")
    private LocalDate fechaApertura;

    @Field("fecha_cierre")
    private LocalDate fechaCierre;

    private List<Opcion> opciones = new ArrayList<>();

    private List<Voto> votos = new ArrayList<>();

    @Field("indice_elegido")
    private String indiceElegido;

    @Field("cantidad_unidades")
    private Double cantidadUnidades;

    /** Una opción: un índice con su cantidad (ej. 5 litros de nafta). */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Opcion {
        private String indice;

        @Field("cantidad_unidades")
        private double cantidadUnidades;
    }

    /** Un voto: quién eligió qué índice y cuándo. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Voto {
        @Field("padre_id")
        private String padreId;

        private String indice;

        private LocalDate fecha;
    }
}
