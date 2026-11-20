package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.Indice;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CotizacionServiceTest {

    @Test
    void archivaLaFechaRealDeLaFuenteSinReetiquetarla() {
        LocalDate hoy = LocalDate.of(2027, 3, 10);
        LocalDate fechaInformadaPorFuente = LocalDate.of(2027, 3, 9);
        CotizacionHistoricaRepository historicas = mock(CotizacionHistoricaRepository.class);
        CotizacionCargadaService cargadas = mock(CotizacionCargadaService.class);
        CotizacionStrategy nafta = strategy(
                Indice.NAFTA_YPF,
                new Cotizacion(Indice.NAFTA_YPF.getId(), fechaInformadaPorFuente, 1500, Cotizacion.AUTOMATICA));
        CotizacionService service = servicio(nafta, cargadas, historicas);
        when(historicas.findFirstByIndiceAndFecha(Indice.NAFTA_YPF.getId(), fechaInformadaPorFuente))
                .thenReturn(Optional.empty());

        service.archivarCotizacionDisponible(Indice.NAFTA_YPF, hoy);

        var registro = org.mockito.ArgumentCaptor.forClass(CotizacionHistorica.class);
        verify(historicas).save(registro.capture());
        assertEquals(fechaInformadaPorFuente, registro.getValue().getFecha());
        assertEquals(1500, registro.getValue().getValorUnitarioArs());
    }

    @Test
    void noSustituyeUnaFechaHistoricaFaltantePorLaCotizacionActual() {
        LocalDate prevista = LocalDate.of(2027, 3, 5);
        CotizacionHistoricaRepository historicas = mock(CotizacionHistoricaRepository.class);
        CotizacionCargadaService cargadas = mock(CotizacionCargadaService.class);
        CotizacionService service = servicio(
                strategy(Indice.NAFTA_YPF, new Cotizacion(
                        Indice.NAFTA_YPF.getId(), prevista.plusDays(5), 1600, Cotizacion.AUTOMATICA)),
                cargadas,
                historicas);
        when(cargadas.enFecha(Indice.NAFTA_YPF, prevista)).thenReturn(Optional.empty());
        when(historicas.findFirstByIndiceAndFecha(Indice.NAFTA_YPF.getId(), prevista))
                .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.obtenerCotizacionHistorica(Indice.NAFTA_YPF, prevista));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
        verify(historicas, never()).save(any(CotizacionHistorica.class));
    }

    @Test
    void priorizaElPrecioCargadoParaLaFechaExacta() {
        LocalDate fecha = LocalDate.of(2027, 3, 5);
        Cotizacion cargada = new Cotizacion(
                Indice.NAFTA_YPF.getId(), fecha, 1490, Cotizacion.CARGADA);
        CotizacionHistoricaRepository historicas = mock(CotizacionHistoricaRepository.class);
        CotizacionCargadaService preciosCargados = mock(CotizacionCargadaService.class);
        when(preciosCargados.enFecha(Indice.NAFTA_YPF, fecha)).thenReturn(Optional.of(cargada));
        CotizacionService service = servicio(
                strategy(Indice.NAFTA_YPF, cargada),
                preciosCargados,
                historicas);

        assertEquals(cargada, service.obtenerCotizacionHistorica(Indice.NAFTA_YPF, fecha));
        verify(historicas, never()).findFirstByIndiceAndFecha(any(), any());
    }

    private static CotizacionService servicio(
            CotizacionStrategy nafta,
            CotizacionCargadaService cargadas,
            CotizacionHistoricaRepository historicas) {
        return new CotizacionService(List.of(
                nafta,
                strategy(Indice.DOLAR_MEP, new Cotizacion(
                        Indice.DOLAR_MEP.getId(), LocalDate.of(2027, 3, 1), 1000, Cotizacion.AUTOMATICA)),
                strategy(Indice.CAJITA_FELIZ, new Cotizacion(
                        Indice.CAJITA_FELIZ.getId(), LocalDate.of(2027, 3, 1), 1000, Cotizacion.CARGADA))),
                cargadas,
                historicas);
    }

    private static CotizacionStrategy strategy(Indice indice, Cotizacion cotizacion) {
        CotizacionStrategy strategy = mock(CotizacionStrategy.class);
        when(strategy.getIndice()).thenReturn(indice);
        when(strategy.obtenerCotizacionActual()).thenReturn(cotizacion);
        return strategy;
    }
}
