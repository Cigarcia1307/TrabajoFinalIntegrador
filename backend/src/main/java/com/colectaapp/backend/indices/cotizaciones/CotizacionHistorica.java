package com.colectaapp.backend.indices.cotizaciones;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cotizacion_historica")
@CompoundIndex(name = "indice_fecha_unico", def = "{'indice': 1, 'fecha': 1}", unique = true)
public class CotizacionHistorica {

    @Id
    private String id;

    private String indice;

    private LocalDate fecha;

    private double valorUnitarioArs;

    private String fuente;
}
