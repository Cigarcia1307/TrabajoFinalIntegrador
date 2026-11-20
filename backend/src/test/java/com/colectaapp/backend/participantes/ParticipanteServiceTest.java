package com.colectaapp.backend.participantes;

import com.colectaapp.backend.auth.Rol;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
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
    private ParticipanteService service;
    private Participante carlos;
    private Participante maria;

    @BeforeEach
    void preparar() {
        repository = mock(ParticipanteRepository.class);
        service = new ParticipanteService(repository);

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

    private static int estado(Throwable error) {
        return ((ResponseStatusException) error).getStatusCode().value();
    }
}
