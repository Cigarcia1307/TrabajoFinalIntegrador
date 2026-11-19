
package com.colectaapp.backend.congelamiento;

import com.colectaapp.backend.colectas.Colecta;
import com.colectaapp.backend.colectas.ColectaRepository;
import com.colectaapp.backend.colectas.CicloLectivoRepository;
import com.colectaapp.backend.indices.Indice;
import com.colectaapp.backend.indices.cotizaciones.Cotizacion;
import com.colectaapp.backend.indices.cotizaciones.CotizacionService;
import com.colectaapp.backend.indices.votacion.VotacionIndice;
import com.colectaapp.backend.indices.votacion.VotacionIndiceRepository;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CongelamientoServiceTest {

    // PRUEBA 1: Cumpleaños lunes, congelamiento viernes
    @Test
    void debeCongelarElViernesSiElCumpleanosEsLunes() {

        CongelamientoService service =
                new CongelamientoService(null, null, null, null, null);

        LocalDate cumpleanos = LocalDate.of(2027, 3, 8);
        LocalDate fechaEsperada = LocalDate.of(2027, 3, 5);

        LocalDate resultado =
                service.calcularDiaCongelamiento(cumpleanos);

        assertEquals(fechaEsperada, resultado);
    }

    // PRUEBA 2: Cumpleaños viernes, congelamiento jueves
    @Test
    void debeCongelarElJuevesSiElCumpleanosEsViernes() {

        CongelamientoService service =
                new CongelamientoService(null, null, null, null, null);

        LocalDate cumpleanos = LocalDate.of(2027, 3, 12);
        LocalDate fechaEsperada = LocalDate.of(2027, 3, 11);

        LocalDate resultado =
                service.calcularDiaCongelamiento(cumpleanos);

        assertEquals(fechaEsperada, resultado);
    }

    // PRUEBA 3: Calcular y guardar el monto congelado
    @Test
    void debeCalcularYGuardarElMontoCongelado() {

        // Simulamos los repositorios y las cotizaciones
        ColectaRepository colectas = mock(ColectaRepository.class);
        CicloLectivoRepository ciclos = mock(CicloLectivoRepository.class);
        VotacionIndiceRepository votaciones = mock(VotacionIndiceRepository.class);
        CotizacionService cotizaciones = mock(CotizacionService.class);
        PrecioReferenciaRepository precios = mock(PrecioReferenciaRepository.class);

        CongelamientoService service = new CongelamientoService(
                colectas, ciclos, votaciones, cotizaciones, precios
        );

        // Creamos una colecta ficticia
        Colecta colecta = new Colecta();
        colecta.setId("colecta-prueba");
        colecta.setCicloLectivo(2027);

        // Simulamos una votación cerrada
        VotacionIndice votacion = new VotacionIndice();
        votacion.setEstado(VotacionIndice.CERRADA);
        votacion.setIndiceElegido("nafta_ypf");
        votacion.setCantidadUnidades(5.0);

        // Cotización ficticia: $1500 por unidad
        Cotizacion cotizacion = new Cotizacion(
                "nafta_ypf",
                LocalDate.of(2027, 3, 5),
                1500.0,
                Cotizacion.CARGADA
        );

        // Configuramos las respuestas simuladas
        when(colectas.findById("colecta-prueba"))
                .thenReturn(Optional.of(colecta));

        when(votaciones.findByCicloLectivo(2027))
                .thenReturn(Optional.of(votacion));

        when(cotizaciones.obtenerCotizacionActual(Indice.NAFTA_YPF))
                .thenReturn(cotizacion);

        when(colectas.save(any(Colecta.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));

        // Ejecutamos el congelamiento
        Colecta resultado = service.congelar("colecta-prueba");

        // Verificamos: 5 x $1500 = $7500
        assertEquals(7500.0, resultado.getMontoIndividualPesos());
        assertEquals("nafta_ypf", resultado.getIndiceReferencia());
        assertEquals(5.0, resultado.getCantidadUnidades());

        // Verificamos que se solicite guardar la información
        verify(precios).save(any(PrecioReferencia.class));
        verify(colectas).save(colecta);
    }

    // PRUEBA 4: No permitir congelar dos veces
    @Test
    void noDebeCongelarDosVecesLaMismaColecta() {

        ColectaRepository colectas = mock(ColectaRepository.class);

        CongelamientoService service = new CongelamientoService(
                colectas, null, null, null, null
        );

        // Creamos una colecta que ya tiene el monto congelado
        Colecta colecta = new Colecta();
        colecta.setId("colecta-prueba");
        colecta.setMontoIndividualPesos(7500.0);
        colecta.setIndiceReferencia("nafta_ypf");
        colecta.setCantidadUnidades(5.0);

        when(colectas.findById("colecta-prueba"))
                .thenReturn(Optional.of(colecta));

        // Verificamos que el sistema rechace el segundo congelamiento
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.congelar("colecta-prueba")
        );

        // Debe responder HTTP 409 (conflicto)
        assertEquals(409, error.getStatusCode().value());

        // No debe volver a guardar la colecta
        verify(colectas, never()).save(any(Colecta.class));
    }
}
