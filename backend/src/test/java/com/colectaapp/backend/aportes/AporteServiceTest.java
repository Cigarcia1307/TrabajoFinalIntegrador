package com.colectaapp.backend.aportes;

import com.colectaapp.backend.aportes.AportesDtos.CambioAporte;
import com.colectaapp.backend.aportes.AportesDtos.ResumenColecta;
import com.colectaapp.backend.colectas.Colecta;
import com.colectaapp.backend.colectas.ColectaRepository;
import com.colectaapp.backend.participantes.Participante;
import com.colectaapp.backend.participantes.ParticipanteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Pruebas del Módulo 6 · Aportes y Pagos (Issue #2).
 *
 * Son pruebas unitarias: los repositorios se reemplazan por "mocks" (objetos de mentira
 * que devuelven lo que les indicamos), así no hace falta MongoDB para correrlas.
 *
 * Escenario de todas las pruebas, igual al que se probó a mano con la app:
 *   - Colecta "Cumple de Tomás": el padre de Tomás es ADMIN, la recauda CARLOS,
 *     monto congelado de $ 7.905 por persona.
 *   - Participantes activos: ADMIN, MARIA y CARLOS.
 */
class AporteServiceTest {

    private static final String COLECTA = "colecta-tomas";
    private static final String ADMIN = "id-admin";
    private static final String MARIA = "id-maria";
    private static final String CARLOS = "id-carlos";
    private static final double MONTO = 7905;

    private ColectaRepository colectaRepository;
    private ParticipanteRepository participanteRepository;
    private AporteService service;
    private Colecta colecta;

    @BeforeEach
    void prepararEscenario() {
        colectaRepository = mock(ColectaRepository.class);
        participanteRepository = mock(ParticipanteRepository.class);
        service = new AporteService(colectaRepository, participanteRepository);

        colecta = new Colecta();
        colecta.setId(COLECTA);
        colecta.setPadreId(ADMIN);
        colecta.setRecaudadorId(CARLOS);
        colecta.setMontoIndividualPesos(MONTO);
        colecta.setMontoTotalObjetivo(MONTO * 2);
        colecta.setEstadoColecta("en_recaudacion");

        when(colectaRepository.findById(COLECTA)).thenReturn(Optional.of(colecta));
        when(colectaRepository.save(any(Colecta.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        List<Participante> activos = List.of(participante(ADMIN), participante(MARIA), participante(CARLOS));
        when(participanteRepository.findByActivoTrue()).thenReturn(activos);
        for (Participante p : activos) {
            when(participanteRepository.findByEmail(p.getEmail())).thenReturn(Optional.of(p));
        }
    }

    private static Participante participante(String id) {
        Participante p = new Participante();
        p.setId(id);
        p.setEmail(email(id));
        p.setActivo(true);
        return p;
    }

    /** "id-maria" → "maria@test.com" (el usuario se identifica por el email del token). */
    private static String email(String id) {
        return id.replace("id-", "") + "@test.com";
    }

    @Nested
    @DisplayName("Creación de los aportes")
    class Creacion {

        @Test
        @DisplayName("al primer acceso se crea un aporte por participante, menos el padre del cumpleañero")
        void creaAportesMenosElPadreDelCumpleanero() {
            List<Aporte> aportes = service.obtenerAportes(COLECTA, email(CARLOS));

            assertThat(aportes).extracting(Aporte::getPadreId).containsExactlyInAnyOrder(MARIA, CARLOS);
            assertThat(aportes).allSatisfy(a -> {
                assertThat(a.getParticipa()).isNull();   // todavía no respondió
                assertThat(a.isPagado()).isFalse();
            });
            verify(colectaRepository).save(colecta);
        }

        @Test
        @DisplayName("si se vuelve a consultar, no se duplican")
        void noDuplicaAportes() {
            service.obtenerAportes(COLECTA, email(CARLOS));
            service.obtenerAportes(COLECTA, email(CARLOS));

            assertThat(colecta.getAportes()).hasSize(2);
        }

        @Test
        @DisplayName("una colecta cerrada no suma participantes nuevos")
        void colectaCerradaNoSumaAportes() {
            colecta.setEstadoColecta("cerrada");

            service.obtenerAportes(COLECTA, email(CARLOS));

            assertThat(colecta.getAportes()).isEmpty();
            verify(colectaRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Regla de visibilidad")
    class Visibilidad {

        @Test
        @DisplayName("un participante ve solo su propio aporte")
        void participanteVeSoloElSuyo() {
            List<Aporte> aportes = service.obtenerAportes(COLECTA, email(MARIA));

            assertThat(aportes).extracting(Aporte::getPadreId).containsExactly(MARIA);
        }

        @Test
        @DisplayName("el recaudador de la colecta ve los aportes de todos")
        void recaudadorVeTodos() {
            List<Aporte> aportes = service.obtenerAportes(COLECTA, email(CARLOS));

            assertThat(aportes).hasSize(2);
        }

        @Test
        @DisplayName("el padre del cumpleañero no tiene aporte en la colecta de su hijo")
        void padreDelCumpleaneroNoAporta() {
            List<Aporte> aportes = service.obtenerAportes(COLECTA, email(ADMIN));

            assertThat(aportes).isEmpty();
        }

        @Test
        @DisplayName("solo el recaudador ve el resumen (403 para los demás)")
        void resumenSoloRecaudador() {
            assertThatThrownBy(() -> service.obtenerResumen(COLECTA, email(MARIA)))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(e -> assertThat(estado(e)).isEqualTo(403));
        }

        @Test
        @DisplayName("solo el recaudador ve la deuda pendiente (403 para los demás)")
        void deudaSoloRecaudador() {
            assertThatThrownBy(() -> service.obtenerDeudaPendiente(COLECTA, email(MARIA)))
                    .satisfies(e -> assertThat(estado(e)).isEqualTo(403));
        }
    }

    @Nested
    @DisplayName("Reglas de pago")
    class Pagos {

        @Test
        @DisplayName("el recaudador registra un pago: queda pagado, con el monto congelado y la fecha")
        void recaudadorRegistraPago() {
            Aporte aporte = service.actualizar(COLECTA, MARIA, new CambioAporte(null, true), email(CARLOS));

            assertThat(aporte.isPagado()).isTrue();
            assertThat(aporte.getParticipa()).isTrue();   // si pagó, participa
            assertThat(aporte.getMontoPagado()).isEqualTo(MONTO);
            assertThat(aporte.getFechaPago()).isNotNull();
            verify(colectaRepository, atLeastOnce()).save(colecta);
        }

        @Test
        @DisplayName("un participante no puede registrar pagos, ni siquiera el suyo (403)")
        void participanteNoRegistraPagos() {
            assertThatThrownBy(() -> service.actualizar(COLECTA, MARIA, new CambioAporte(null, true), email(MARIA)))
                    .satisfies(e -> assertThat(estado(e)).isEqualTo(403));
        }

        @Test
        @DisplayName("no se registran pagos si el monto todavía no se congeló (409)")
        void sinMontoCongeladoNoSePaga() {
            colecta.setMontoIndividualPesos(0);

            assertThatThrownBy(() -> service.actualizar(COLECTA, MARIA, new CambioAporte(null, true), email(CARLOS)))
                    .satisfies(e -> assertThat(estado(e)).isEqualTo(409));
        }

        @Test
        @DisplayName("en una colecta cerrada no se modifica nada (403)")
        void colectaCerradaNoSeModifica() {
            service.obtenerAportes(COLECTA, email(CARLOS));   // crea los aportes
            colecta.setEstadoColecta("cerrada");

            assertThatThrownBy(() -> service.actualizar(COLECTA, MARIA, new CambioAporte(true, null), email(MARIA)))
                    .satisfies(e -> assertThat(estado(e)).isEqualTo(403));
        }

        @Test
        @DisplayName("deshacer un pago lo deja pendiente y sin monto")
        void deshacerPago() {
            service.actualizar(COLECTA, MARIA, new CambioAporte(null, true), email(CARLOS));

            Aporte aporte = service.actualizar(COLECTA, MARIA, new CambioAporte(null, false), email(CARLOS));

            assertThat(aporte.isPagado()).isFalse();
            assertThat(aporte.getMontoPagado()).isZero();
            assertThat(aporte.getFechaPago()).isNull();
        }
    }

    @Nested
    @DisplayName("Decisión de participar")
    class Participacion {

        @Test
        @DisplayName("cada participante responde por sí mismo")
        void participanteRespondePorSiMismo() {
            Aporte aporte = service.actualizar(COLECTA, MARIA, new CambioAporte(true, null), email(MARIA));

            assertThat(aporte.getParticipa()).isTrue();
            assertThat(aporte.isPagado()).isFalse();
        }

        @Test
        @DisplayName("un participante no puede modificar el aporte de otro (403)")
        void noModificaAporteAjeno() {
            assertThatThrownBy(() -> service.actualizar(COLECTA, CARLOS, new CambioAporte(false, null), email(MARIA)))
                    .satisfies(e -> assertThat(estado(e)).isEqualTo(403));
        }

        @Test
        @DisplayName("si alguien que pagó decide no participar, su pago se anula")
        void noParticiparAnulaPago() {
            service.actualizar(COLECTA, MARIA, new CambioAporte(null, true), email(CARLOS));

            Aporte aporte = service.actualizar(COLECTA, MARIA, new CambioAporte(false, null), email(MARIA));

            assertThat(aporte.getParticipa()).isFalse();
            assertThat(aporte.isPagado()).isFalse();
            assertThat(aporte.getMontoPagado()).isZero();
        }
    }

    @Test
    @DisplayName("el resumen suma lo recaudado y cuenta pagos, pendientes y sin responder")
    void resumenCuentaBien() {
        service.actualizar(COLECTA, MARIA, new CambioAporte(null, true), email(CARLOS));

        ResumenColecta resumen = service.obtenerResumen(COLECTA, email(CARLOS));

        assertThat(resumen.recaudado()).isEqualTo(MONTO);
        assertThat(resumen.montoTotalObjetivo()).isEqualTo(MONTO * 2);
        assertThat(resumen.cantidadParticipan()).isEqualTo(1);
        assertThat(resumen.cantidadPagaron()).isEqualTo(1);
        assertThat(resumen.cantidadPendientes()).isZero();
        assertThat(resumen.cantidadSinResponder()).isEqualTo(1);   // Carlos todavía no respondió
    }

    /** Código HTTP de una ResponseStatusException (403, 409, ...). */
    private static int estado(Throwable e) {
        return ((ResponseStatusException) e).getStatusCode().value();
    }
}
