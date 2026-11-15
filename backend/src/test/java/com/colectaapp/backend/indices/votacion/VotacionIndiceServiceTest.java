package com.colectaapp.backend.indices.votacion;

import com.colectaapp.backend.colectas.CicloLectivo;
import com.colectaapp.backend.colectas.CicloLectivoRepository;
import com.colectaapp.backend.indices.dto.IndicesDtos.IndiceVigenteResponse;
import com.colectaapp.backend.indices.dto.IndicesDtos.NuevaVotacionRequest;
import com.colectaapp.backend.indices.dto.IndicesDtos.OpcionRequest;
import com.colectaapp.backend.indices.dto.IndicesDtos.VotacionAbiertaResponse;
import com.colectaapp.backend.participantes.Participante;
import com.colectaapp.backend.participantes.ParticipanteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Pruebas de la votación del índice (Módulo 4, Issue #4).
 *
 * Reglas que se comprueban (database/esquema_base_datos.md, sección 4):
 * una sola votación por ciclo, un voto por participante, gana la más votada,
 * el empate lo decide el administrador, y el resultado queda fijo para el año.
 *
 * El repositorio de votaciones es un mock que "guarda" en una variable,
 * así no hace falta MongoDB.
 */
class VotacionIndiceServiceTest {

    private static final int CICLO = 2026;

    private VotacionIndiceRepository repository;
    private ParticipanteRepository participanteRepository;
    private VotacionIndiceService service;

    /** La votación "guardada" en la base de mentira. */
    private VotacionIndice guardada;

    @BeforeEach
    void prepararEscenario() {
        repository = mock(VotacionIndiceRepository.class);
        participanteRepository = mock(ParticipanteRepository.class);
        CicloLectivoRepository cicloRepository = mock(CicloLectivoRepository.class);
        service = new VotacionIndiceService(repository, participanteRepository, cicloRepository);
        guardada = null;

        when(cicloRepository.findAll()).thenReturn(List.of(new CicloLectivo("ciclo", CICLO, true)));
        when(repository.findByCicloLectivo(anyInt())).thenAnswer(i -> Optional.ofNullable(guardada));
        when(repository.save(any(VotacionIndice.class))).thenAnswer(i -> {
            guardada = i.getArgument(0);
            return guardada;
        });

        List<Participante> activos = List.of(participante("admin"), participante("maria"), participante("carlos"));
        when(participanteRepository.findByActivoTrue()).thenReturn(activos);
        for (Participante p : activos) {
            when(participanteRepository.findByEmail(p.getEmail())).thenReturn(Optional.of(p));
            when(participanteRepository.findById(p.getId())).thenReturn(Optional.of(p));
        }
    }

    private static Participante participante(String nombre) {
        Participante p = new Participante();
        p.setId("id-" + nombre);
        p.setNombre(nombre);
        p.setApellido("Test");
        p.setEmail(nombre + "@test.com");
        p.setActivo(true);
        return p;
    }

    /** El admin abre la votación con las tres opciones de siempre. */
    private void abrirVotacion() {
        service.abrir("admin@test.com", new NuevaVotacionRequest(List.of(
                new OpcionRequest("nafta_ypf", 5.0),
                new OpcionRequest("dolar_mep", 5.0),
                new OpcionRequest("cajita_feliz", 1.0))));
    }

    @Test
    @DisplayName("al abrir, la votación queda abierta para el ciclo actual y sin votos")
    void abrirVotacion_quedaAbierta() {
        abrirVotacion();

        assertThat(guardada.getCicloLectivo()).isEqualTo(CICLO);
        assertThat(guardada.getEstado()).isEqualTo(VotacionIndice.ABIERTA);
        assertThat(guardada.getVotos()).isEmpty();
        assertThat(service.vigente()).isEmpty();   // todavía no hay índice elegido
    }

    @Test
    @DisplayName("no se puede abrir una segunda votación en el mismo ciclo (409): el índice no cambia en el año")
    void unaSolaVotacionPorCiclo() {
        abrirVotacion();

        assertThatThrownBy(this::abrirVotacion)
                .satisfies(e -> assertThat(estado(e)).isEqualTo(409));
    }

    @Test
    @DisplayName("no se aceptan opciones repetidas ni índices desconocidos (400)")
    void opcionesInvalidas() {
        assertThatThrownBy(() -> service.abrir("admin@test.com", new NuevaVotacionRequest(List.of(
                new OpcionRequest("nafta_ypf", 5.0),
                new OpcionRequest("nafta_ypf", 6.0)))))
                .satisfies(e -> assertThat(estado(e)).isEqualTo(400));

        assertThatThrownBy(() -> service.abrir("admin@test.com", new NuevaVotacionRequest(List.of(
                new OpcionRequest("bitcoin", 1.0),
                new OpcionRequest("dolar_mep", 5.0)))))
                .satisfies(e -> assertThat(estado(e)).isEqualTo(400));
    }

    @Test
    @DisplayName("cada participante vota una sola vez (409 si repite)")
    void votoUnico() {
        abrirVotacion();
        service.votar("maria@test.com", "dolar_mep");

        assertThatThrownBy(() -> service.votar("maria@test.com", "nafta_ypf"))
                .satisfies(e -> assertThat(estado(e)).isEqualTo(409));
    }

    @Test
    @DisplayName("cada uno ve su voto y el conteo, no quién votó qué")
    void vistaConConteosYMiVoto() {
        abrirVotacion();
        service.votar("maria@test.com", "dolar_mep");
        VotacionAbiertaResponse vista = service.votar("carlos@test.com", "nafta_ypf");

        assertThat(vista.miVoto()).isEqualTo("nafta_ypf");
        assertThat(vista.cantidadVotaron()).isEqualTo(2);
        assertThat(vista.cantidadParticipantes()).isEqualTo(3);
    }

    @Test
    @DisplayName("al cerrar gana la opción más votada y queda fija para el ciclo")
    void ganaLaMasVotada() {
        abrirVotacion();
        service.votar("maria@test.com", "dolar_mep");
        service.votar("carlos@test.com", "dolar_mep");
        service.votar("admin@test.com", "nafta_ypf");

        IndiceVigenteResponse resultado = service.cerrar(null);

        assertThat(resultado.indice()).isEqualTo("dolar_mep");
        assertThat(resultado.cantidadUnidades()).isEqualTo(5.0);
        assertThat(guardada.getEstado()).isEqualTo(VotacionIndice.CERRADA);
        assertThat(service.vigente()).contains(resultado);
        assertThat(service.resultadoDelCiclo(CICLO)).contains(resultado);   // lo que usa el congelamiento
    }

    @Test
    @DisplayName("con empate, cerrar sin desempate da 409; con desempate gana la elegida")
    void empateLoDecideElAdmin() {
        abrirVotacion();
        service.votar("maria@test.com", "dolar_mep");
        service.votar("carlos@test.com", "nafta_ypf");

        assertThatThrownBy(() -> service.cerrar(null))
                .satisfies(e -> assertThat(estado(e)).isEqualTo(409));

        assertThat(service.cerrar("nafta_ypf").indice()).isEqualTo("nafta_ypf");
    }

    @Test
    @DisplayName("una vez cerrada, no se puede votar ni volver a cerrar (409)")
    void cerradaNoAceptaCambios() {
        abrirVotacion();
        service.votar("maria@test.com", "dolar_mep");
        service.cerrar(null);

        assertThatThrownBy(() -> service.votar("carlos@test.com", "nafta_ypf"))
                .satisfies(e -> assertThat(estado(e)).isEqualTo(409));
        assertThatThrownBy(() -> service.cerrar(null))
                .satisfies(e -> assertThat(estado(e)).isEqualTo(409));
    }

    private static int estado(Throwable e) {
        return ((ResponseStatusException) e).getStatusCode().value();
    }
}
