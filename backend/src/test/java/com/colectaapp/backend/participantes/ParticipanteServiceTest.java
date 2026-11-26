package com.colectaapp.backend.participantes;

import com.colectaapp.backend.auth.Rol;
import com.colectaapp.backend.aportes.Aporte;
import com.colectaapp.backend.colectas.CicloLectivo;
import com.colectaapp.backend.colectas.CicloLectivoRepository;
import com.colectaapp.backend.colectas.Colecta;
import com.colectaapp.backend.colectas.ColectaRepository;
import com.colectaapp.backend.congelamiento.PrecioReferencia;
import com.colectaapp.backend.congelamiento.PrecioReferenciaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ParticipanteServiceTest {

    private static final String CARLOS_ID = "carlos-id";
    private static final String MARIA_ID = "maria-id";
    private static final String ADMIN_ID = "admin-id";
    private static final String CARLOS_EMAIL = "carlos@test.com";
    private static final String MARIA_EMAIL = "maria@test.com";
    private static final String ADMIN_EMAIL = "admin@test.com";

    private ParticipanteRepository repository;
    private CicloLectivoRepository cicloRepository;
    private ColectaRepository colectaRepository;
    private PrecioReferenciaRepository precioRepository;
    private ParticipanteService service;
    private Participante carlos;
    private Participante maria;

    @BeforeEach
    void preparar() {
        repository = mock(ParticipanteRepository.class);
        cicloRepository = mock(CicloLectivoRepository.class);
        colectaRepository = mock(ColectaRepository.class);
        precioRepository = mock(PrecioReferenciaRepository.class);
        service = new ParticipanteService(
                repository, cicloRepository, colectaRepository, precioRepository);

        carlos = participante(CARLOS_ID, CARLOS_EMAIL, Rol.PARTICIPANTE);
        maria = participante(MARIA_ID, MARIA_EMAIL, Rol.PARTICIPANTE);
        Participante admin = participante(ADMIN_ID, ADMIN_EMAIL, Rol.ADMINISTRADOR);

        when(repository.findByEmail(CARLOS_EMAIL)).thenReturn(Optional.of(carlos));
        when(repository.findByEmail(MARIA_EMAIL)).thenReturn(Optional.of(maria));
        when(repository.findByEmail(ADMIN_EMAIL)).thenReturn(Optional.of(admin));
        when(repository.findById(CARLOS_ID)).thenReturn(Optional.of(carlos));
        when(repository.findById(MARIA_ID)).thenReturn(Optional.of(maria));
        when(repository.save(any(Participante.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));
    }

    @Test
    void participantePuedeActualizarSuPropiaInformacion() {
        Participante datos = new Participante();
        datos.setNombre("Carlos actualizado");
        datos.setApellido("Fernández");

        Participante actualizado = service.actualizar(CARLOS_ID, datos, CARLOS_EMAIL);

        assertThat(actualizado.getNombre()).isEqualTo("Carlos actualizado");
        verify(repository).save(carlos);
    }

    @Test
    void participanteNoPuedeActualizarInformacionDeOtro() {
        Participante datos = new Participante();
        datos.setNombre("Nombre modificado");

        assertThatThrownBy(() -> service.actualizar(MARIA_ID, datos, CARLOS_EMAIL))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(estado(error)).isEqualTo(HttpStatus.FORBIDDEN.value()));

        verify(repository, never()).save(any(Participante.class));
    }

    @Test
    void administradorPuedeActualizarOtroParticipante() {
        Participante datos = new Participante();
        datos.setNombre("Nombre administrado");

        Participante actualizado = service.actualizar(MARIA_ID, datos, ADMIN_EMAIL);

        assertThat(actualizado.getNombre()).isEqualTo("Nombre administrado");
        verify(repository).save(maria);
    }

    @Test
    void participantePuedeAgregarBeneficiarioPropio() {
        Beneficiario beneficiario = new Beneficiario("Hijo", LocalDate.of(2018, 4, 12));

        Participante actualizado = service.agregarBeneficiario(CARLOS_ID, beneficiario, CARLOS_EMAIL);

        assertThat(actualizado.getHijos()).containsExactly(beneficiario);
        verify(repository).save(carlos);
    }

    @Test
    void padreSolicitaCambioSinModificarLaFechaVigente() {
        carlos.getHijos().add(new Beneficiario("Hijo", LocalDate.of(2018, 4, 12)));

        Participante actualizado = service.solicitarCambioFecha(
                CARLOS_ID, 0, LocalDate.of(2018, 5, 2), CARLOS_EMAIL);

        assertThat(actualizado.getHijos().get(0).getFechaNacimiento())
                .isEqualTo(LocalDate.of(2018, 4, 12));
        assertThat(actualizado.getHijos().get(0).getFechaNacimientoSolicitada())
                .isEqualTo(LocalDate.of(2018, 5, 2));
    }

    @Test
    void actualizacionGeneralDelPadreNoPuedeAplicarLaFechaDirectamente() {
        carlos.getHijos().add(new Beneficiario("Hijo", LocalDate.of(2018, 4, 12)));
        Participante datos = new Participante();
        datos.setHijos(List.of(new Beneficiario("Hijo", LocalDate.of(2018, 5, 2))));

        Participante actualizado = service.actualizar(CARLOS_ID, datos, CARLOS_EMAIL);

        assertThat(actualizado.getHijos().get(0).getFechaNacimiento())
                .isEqualTo(LocalDate.of(2018, 4, 12));
        assertThat(actualizado.getHijos().get(0).getFechaNacimientoSolicitada())
                .isEqualTo(LocalDate.of(2018, 5, 2));
    }

    @Test
    void soloAdministradorPuedeAprobarLaSolicitud() {
        carlos.getHijos().add(new Beneficiario("Hijo", LocalDate.of(2018, 4, 12)));
        carlos.getHijos().get(0).setFechaNacimientoSolicitada(LocalDate.of(2018, 5, 2));

        assertThatThrownBy(() -> service.aprobarCambioFecha(CARLOS_ID, 0, CARLOS_EMAIL))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(estado(error)).isEqualTo(HttpStatus.FORBIDDEN.value()));

        assertThat(carlos.getHijos().get(0).getFechaNacimiento())
                .isEqualTo(LocalDate.of(2018, 4, 12));
    }

    @Test
    void aprobarCambioActualizaFechaYDescongelaSiTodaviaNoHuboAportes() {
        Beneficiario hijo = new Beneficiario("Hijo", LocalDate.of(2018, 4, 12));
        hijo.setFechaNacimientoSolicitada(LocalDate.of(2018, 5, 2));
        carlos.getHijos().add(hijo);
        Colecta colecta = colectaSinAportes();
        colecta.setMontoIndividualPesos(1500);
        colecta.setIndiceReferencia("nafta_ypf");
        colecta.setCantidadUnidades(5.0);
        when(cicloRepository.findAll()).thenReturn(List.of(new CicloLectivo("ciclo", 2018, true)));
        when(colectaRepository.findByCicloLectivo(2018)).thenReturn(List.of(colecta));
        PrecioReferencia precio = new PrecioReferencia();
        when(precioRepository.findByColectaId("colecta")).thenReturn(Optional.of(precio));

        service.aprobarCambioFecha(CARLOS_ID, 0, ADMIN_EMAIL);

        assertThat(hijo.getFechaNacimiento()).isEqualTo(LocalDate.of(2018, 5, 2));
        assertThat(hijo.getFechaNacimientoSolicitada()).isNull();
        assertThat(colecta.getFechaCumpleanos()).isEqualTo(LocalDate.of(2018, 5, 2));
        assertThat(colecta.getMontoIndividualPesos()).isZero();
        assertThat(colecta.getIndiceReferencia()).isNull();
        assertThat(colecta.getCantidadUnidades()).isNull();
        verify(precioRepository).delete(precio);
        verify(colectaRepository).save(colecta);
    }

    @Test
    void aprobarCambioMantieneColectaYCongelamientoSiYaHuboAportes() {
        Beneficiario hijo = new Beneficiario("Hijo", LocalDate.of(2018, 4, 12));
        hijo.setFechaNacimientoSolicitada(LocalDate.of(2018, 5, 2));
        carlos.getHijos().add(hijo);
        Colecta colecta = colectaSinAportes();
        colecta.setMontoIndividualPesos(1500);
        colecta.setAportes(new ArrayList<>(List.of(
                new Aporte(MARIA_ID, true, 1500, "2018-04-10", true))));
        when(cicloRepository.findAll()).thenReturn(List.of(new CicloLectivo("ciclo", 2018, true)));
        when(colectaRepository.findByCicloLectivo(2018)).thenReturn(List.of(colecta));

        service.aprobarCambioFecha(CARLOS_ID, 0, ADMIN_EMAIL);

        assertThat(colecta.getFechaCumpleanos()).isEqualTo(LocalDate.of(2018, 4, 12));
        assertThat(colecta.getMontoIndividualPesos()).isEqualTo(1500);
        verify(colectaRepository, never()).save(any(Colecta.class));
        verify(precioRepository, never()).delete(any(PrecioReferencia.class));
    }

    @Test
    void participanteNoPuedeAgregarBeneficiarioAOtro() {
        Beneficiario beneficiario = new Beneficiario("Hijo", LocalDate.of(2018, 4, 12));

        assertThatThrownBy(() -> service.agregarBeneficiario(MARIA_ID, beneficiario, CARLOS_EMAIL))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(estado(error)).isEqualTo(HttpStatus.FORBIDDEN.value()));

        verify(repository, never()).save(any(Participante.class));
    }

    private static Participante participante(String id, String email, Rol rol) {
        Participante participante = new Participante();
        participante.setId(id);
        participante.setEmail(email);
        participante.setRol(rol);
        return participante;
    }

    private Colecta colectaSinAportes() {
        Colecta colecta = new Colecta();
        colecta.setId("colecta");
        colecta.setCicloLectivo(2018);
        colecta.setFechaCumpleanos(LocalDate.of(2018, 4, 12));
        colecta.setEstadoColecta("en_recaudacion");
        colecta.setActivo(true);
        colecta.setPadreId(CARLOS_ID);
        colecta.setBeneficiarioNombre("Hijo");
        return colecta;
    }

    private static int estado(Throwable error) {
        return ((ResponseStatusException) error).getStatusCode().value();
    }
}
