package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.cotizaciones.NaftaYpfStrategy.PrecioInformado;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

/**
 * Pruebas de la Strategy de la nafta (Módulo 4): cómo se lee el CSV de datos abiertos
 * y cómo se calcula el precio. No descargan nada: prueban el cálculo con datos fijos.
 */
class NaftaYpfStrategyTest {

    private final NaftaYpfStrategy strategy =
            new NaftaYpfStrategy(mock(CotizacionCargadaService.class), "", "CAPITAL FEDERAL");

    @Test
    @DisplayName("separa columnas respetando comas dentro de comillas")
    void separaRespetandoComillas() {
        List<String> campos = NaftaYpfStrategy.separar("YPF,\"Av. Rivadavia 1234, Flores\",1490");

        assertThat(campos).containsExactly("YPF", "Av. Rivadavia 1234, Flores", "1490");
    }

    @Test
    @DisplayName("normaliza mayúsculas, tildes y espacios para comparar")
    void normalizaTexto() {
        assertThat(NaftaYpfStrategy.normalizar("  Nafta (súper) entre 92 y 95 Ron "))
                .isEqualTo("nafta (super) entre 92 y 95 ron");
    }

    @Test
    @DisplayName("la mediana no se mueve por un precio raro")
    void medianaIgnoraValoresExtremos() {
        assertThat(NaftaYpfStrategy.mediana(List.of(2000.0, 2050.0, 2100.0, 9999.0, 1.0)))
                .isEqualTo(2050.0);
        assertThat(NaftaYpfStrategy.mediana(List.of(2000.0, 2100.0)))
                .isEqualTo(2050.0);   // cantidad par: promedio de los dos del medio
    }

    @Test
    @DisplayName("descarta los precios desactualizados (más de 30 días antes del más reciente)")
    void descartaPreciosDesactualizados() {
        LocalDate reciente = LocalDate.of(2026, 9, 30);
        List<PrecioInformado> informados = List.of(
                new PrecioInformado(2000, reciente),
                new PrecioInformado(2060, reciente.minusDays(5)),
                new PrecioInformado(2100, reciente.minusDays(20)),
                new PrecioInformado(1100, reciente.minusDays(120)),   // estación que no actualiza hace meses
                new PrecioInformado(1050, reciente.minusDays(200)));

        Cotizacion cotizacion = strategy.calcular(informados);

        assertThat(cotizacion.valorUnitarioArs()).isEqualTo(2060.0);   // mediana de 2000, 2060 y 2100
        assertThat(cotizacion.fecha()).isEqualTo(reciente);            // la del dato más nuevo, no la de hoy
        assertThat(cotizacion.fuente()).isEqualTo(Cotizacion.AUTOMATICA);
    }

    @Test
    @DisplayName("si ningún precio trae fecha, usa todos")
    void sinFechasUsaTodos() {
        Cotizacion cotizacion = strategy.calcular(List.of(
                new PrecioInformado(1000, null),
                new PrecioInformado(2000, null),
                new PrecioInformado(3000, null)));

        assertThat(cotizacion.valorUnitarioArs()).isEqualTo(2000.0);
    }
}
