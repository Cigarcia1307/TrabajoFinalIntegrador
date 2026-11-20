package com.colectaapp.backend.congelamiento;

import com.colectaapp.backend.colectas.CicloLectivo;
import com.colectaapp.backend.colectas.CicloLectivoRepository;
import com.colectaapp.backend.colectas.Colecta;
import com.colectaapp.backend.colectas.ColectaRepository;
import com.colectaapp.backend.indices.Indice;
import com.colectaapp.backend.indices.cotizaciones.Cotizacion;
import com.colectaapp.backend.indices.cotizaciones.CotizacionService;
import com.colectaapp.backend.indices.votacion.VotacionIndice;
import com.colectaapp.backend.indices.votacion.VotacionIndiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class CongelamientoServiceTest {

    private ColectaRepository colectas;
    private CicloLectivoRepository ciclos;
    private VotacionIndiceRepository votaciones;
    private CotizacionService cotizaciones;
    private PrecioReferenciaRepository precios;
    private CongelamientoService service;

    @BeforeEach
    void preparar() {
        colectas = mock(ColectaRepository.class);
        ciclos = mock(CicloLectivoRepository.class);
        votaciones = mock(VotacionIndiceRepository.class);
        cotizaciones = mock(CotizacionService.class);
        precios = mock(PrecioReferenciaRepository.class);
        service = new CongelamientoService(colectas, ciclos, votaciones, cotizaciones, precios);

        when(precios.findByColectaId(anyString())).thenReturn(Optional.empty());
        when(precios.save(any(PrecioReferencia.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));
        when(colectas.save(any(Colecta.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));
    }

    @Test
    void debeCalcularElViernesComoDiaHabilAnteriorAlCumpleanosDelLunes() {
        assertEquals(
                LocalDate.of(2027, 3, 5),
                service.calcularDiaCongelamiento(LocalDate.of(2027, 3, 8)));
    }

    @Test
    void debeCalcularElViernesAnteriorSiElCumpleanosEsSabado() {
        assertEquals(
                LocalDate.of(2027, 3, 5),
                service.calcularDiaCongelamiento(LocalDate.of(2027, 3, 6)));
    }

    @Test
    void congelaConLaCotizacionHistoricaExactaEnLaFechaPrevista() {
        LocalDate prevista = LocalDate.of(2027, 3, 5);
        Colecta colecta = colecta("colecta-prueba", 2027, LocalDate.of(2027, 3, 8));
        configurarVotacionCerrada(2027);
        when(colectas.findById(colecta.getId())).thenReturn(Optional.of(colecta));
        when(cotizaciones.obtenerCotizacionHistorica(Indice.NAFTA_YPF, prevista))
                .thenReturn(cotizacion(prevista, 1500));

        Colecta resultado = service.congelar(colecta.getId(), prevista);

        assertEquals(7500.0, resultado.getMontoIndividualPesos());
        assertEquals("nafta_ypf", resultado.getIndiceReferencia());
        assertEquals(5.0, resultado.getCantidadUnidades());
        verify(cotizaciones).obtenerCotizacionHistorica(Indice.NAFTA_YPF, prevista);
        verify(cotizaciones, never()).obtenerCotizacionActual(any());

        var referencia = org.mockito.ArgumentCaptor.forClass(PrecioReferencia.class);
        verify(precios).save(referencia.capture());
        assertEquals(prevista, referencia.getValue().getFecha());
        assertEquals(prevista, referencia.getValue().getFechaCongelamientoPrevista());
        assertEquals(prevista, referencia.getValue().getFechaCongelamientoReal());
    }

    @Test
    void recuperaUnaColectaVencidaConElValorDeLaFechaHistoricaOriginal() {
        LocalDate prevista = LocalDate.of(2027, 3, 5);
        LocalDate recuperada = LocalDate.of(2027, 3, 10);
        Colecta colecta = colecta("colecta-atrasada", 2027, LocalDate.of(2027, 3, 8));
        configurarVotacionCerrada(2027);
        when(ciclos.findAll()).thenReturn(List.of(new CicloLectivo("ciclo-2027", 2027, true)));
        when(colectas.findByCicloLectivo(2027)).thenReturn(List.of(colecta));
        when(colectas.findById(colecta.getId())).thenReturn(Optional.of(colecta));
        when(cotizaciones.obtenerCotizacionHistorica(Indice.NAFTA_YPF, prevista))
                .thenReturn(cotizacion(prevista, 1500));

        service.congelarColectasPendientes(recuperada);

        assertEquals(7500.0, colecta.getMontoIndividualPesos());
        verify(cotizaciones).obtenerCotizacionHistorica(Indice.NAFTA_YPF, prevista);
        verify(cotizaciones, never()).obtenerCotizacionActual(any());
        var referencia = org.mockito.ArgumentCaptor.forClass(PrecioReferencia.class);
        verify(precios).save(referencia.capture());
        assertEquals(prevista, referencia.getValue().getFecha());
        assertEquals(prevista, referencia.getValue().getFechaCongelamientoPrevista());
        assertEquals(recuperada, referencia.getValue().getFechaCongelamientoReal());
    }

    @Test
    void dejaPendienteLaColectaSiFaltaLaCotizacionHistorica() {
        LocalDate prevista = LocalDate.of(2027, 3, 5);
        Colecta colecta = colecta("colecta-sin-cotizacion", 2027, LocalDate.of(2027, 3, 8));
        configurarVotacionCerrada(2027);
        when(ciclos.findAll()).thenReturn(List.of(new CicloLectivo("ciclo-2027", 2027, true)));
        when(colectas.findByCicloLectivo(2027)).thenReturn(List.of(colecta));
        when(colectas.findById(colecta.getId())).thenReturn(Optional.of(colecta));
        when(cotizaciones.obtenerCotizacionHistorica(Indice.NAFTA_YPF, prevista))
                .thenThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE));

        service.congelarColectasPendientes(LocalDate.of(2027, 3, 10));

        assertEquals(0, colecta.getMontoIndividualPesos());
        verify(precios, never()).save(any(PrecioReferencia.class));
        verify(colectas, never()).save(any(Colecta.class));
    }

    @Test
    void noCongelaMientrasLaVotacionSigaAbierta() {
        Colecta colecta = colecta("colecta-votacion-abierta", 2027, LocalDate.of(2027, 3, 8));
        VotacionIndice votacion = new VotacionIndice();
        votacion.setEstado(VotacionIndice.ABIERTA);
        when(ciclos.findAll()).thenReturn(List.of(new CicloLectivo("ciclo-2027", 2027, true)));
        when(colectas.findByCicloLectivo(2027)).thenReturn(List.of(colecta));
        when(colectas.findById(colecta.getId())).thenReturn(Optional.of(colecta));
        when(votaciones.findByCicloLectivo(2027)).thenReturn(Optional.of(votacion));

        service.congelarColectasPendientes(LocalDate.of(2027, 3, 10));

        verify(cotizaciones, never()).obtenerCotizacionHistorica(any(), any());
        verify(precios, never()).save(any(PrecioReferencia.class));
    }

    @Test
    void noPermiteCongelarDosVecesLaMismaColecta() {
        LocalDate prevista = LocalDate.of(2027, 3, 5);
        Colecta colecta = colecta("colecta-duplicada", 2027, LocalDate.of(2027, 3, 8));
        configurarVotacionCerrada(2027);
        when(colectas.findById(colecta.getId())).thenReturn(Optional.of(colecta));
        when(cotizaciones.obtenerCotizacionHistorica(Indice.NAFTA_YPF, prevista))
                .thenReturn(cotizacion(prevista, 1500));

        service.congelar(colecta.getId(), prevista);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.congelar(colecta.getId(), prevista));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(precios, times(1)).save(any(PrecioReferencia.class));
    }

    @Test
    void traduceLaCarreraEntreCongelamientoManualYAutomaticoAConflicto() {
        LocalDate prevista = LocalDate.of(2027, 3, 5);
        Colecta colecta = colecta("colecta-en-carrera", 2027, LocalDate.of(2027, 3, 8));
        configurarVotacionCerrada(2027);
        when(colectas.findById(colecta.getId())).thenReturn(Optional.of(colecta));
        when(cotizaciones.obtenerCotizacionHistorica(Indice.NAFTA_YPF, prevista))
                .thenReturn(cotizacion(prevista, 1500));
        when(precios.save(any(PrecioReferencia.class)))
                .thenThrow(new DuplicateKeyException("Unique colecta_id"));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.congelar(colecta.getId(), prevista));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(colectas, never()).save(any(Colecta.class));
    }

    private void configurarVotacionCerrada(int ciclo) {
        VotacionIndice votacion = new VotacionIndice();
        votacion.setEstado(VotacionIndice.CERRADA);
        votacion.setIndiceElegido(Indice.NAFTA_YPF.getId());
        votacion.setCantidadUnidades(5.0);
        when(votaciones.findByCicloLectivo(ciclo)).thenReturn(Optional.of(votacion));
    }

    private static Colecta colecta(String id, int ciclo, LocalDate cumpleanos) {
        Colecta colecta = new Colecta();
        colecta.setId(id);
        colecta.setCicloLectivo(ciclo);
        colecta.setFechaCumpleanos(cumpleanos);
        colecta.setActivo(true);
        return colecta;
    }

    private static Cotizacion cotizacion(LocalDate fecha, double valor) {
        return new Cotizacion(Indice.NAFTA_YPF.getId(), fecha, valor, Cotizacion.CARGADA);
    }
}
