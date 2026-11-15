package com.colectaapp.backend.indices.votacion;

import com.colectaapp.backend.colectas.CicloLectivo;
import com.colectaapp.backend.colectas.CicloLectivoRepository;
import com.colectaapp.backend.indices.Indice;
import com.colectaapp.backend.indices.dto.IndicesDtos.IndiceVigenteResponse;
import com.colectaapp.backend.indices.dto.IndicesDtos.NuevaVotacionRequest;
import com.colectaapp.backend.indices.dto.IndicesDtos.OpcionRequest;
import com.colectaapp.backend.indices.dto.IndicesDtos.ResultadoOpcion;
import com.colectaapp.backend.indices.dto.IndicesDtos.VotacionAbiertaResponse;
import com.colectaapp.backend.participantes.Participante;
import com.colectaapp.backend.participantes.ParticipanteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Votación del índice del ciclo (Módulo 4).
 *
 * Reglas (database/esquema_base_datos.md, sección 4):
 * - Una sola votación por ciclo lectivo; su resultado no se modifica durante el año.
 * - La abre y la cierra un ADMINISTRADOR; cada participante vota una sola vez.
 * - Al cerrar gana la opción más votada; si hay empate, decide el administrador.
 */
@Service
public class VotacionIndiceService {

    private final VotacionIndiceRepository repository;
    private final ParticipanteRepository participanteRepository;
    private final CicloLectivoRepository cicloLectivoRepository;

    public VotacionIndiceService(
            VotacionIndiceRepository repository,
            ParticipanteRepository participanteRepository,
            CicloLectivoRepository cicloLectivoRepository) {
        this.repository = repository;
        this.participanteRepository = participanteRepository;
        this.cicloLectivoRepository = cicloLectivoRepository;
    }

    // ── Consultas ───────────────────────────────────────────────────────────

    /** Lo elegido para el ciclo actual, o vacío si la votación todavía no cerró. */
    public Optional<IndiceVigenteResponse> vigente() {
        return resultadoDelCiclo(cicloActual());
    }

    /**
     * Resultado de la votación de un ciclo. Pensado también para el congelamiento
     * (Módulo 5): de acá salen el índice y la cantidad que se copian a cada colecta.
     */
    public Optional<IndiceVigenteResponse> resultadoDelCiclo(int ciclo) {
        return repository.findByCicloLectivo(ciclo)
                .filter(v -> VotacionIndice.CERRADA.equals(v.getEstado()))
                .map(v -> new IndiceVigenteResponse(
                        v.getId(), v.getIndiceElegido(), v.getCantidadUnidades(), v.getFechaCierre()));
    }

    /** La votación del ciclo si está abierta, vista por el usuario logueado. */
    public Optional<VotacionAbiertaResponse> abierta(String emailUsuario) {
        Participante usuario = participantePorEmail(emailUsuario);
        return votacionDelCiclo()
                .filter(v -> VotacionIndice.ABIERTA.equals(v.getEstado()))
                .map(v -> vistaDe(v, usuario));
    }

    // ── Acciones ────────────────────────────────────────────────────────────

    public VotacionAbiertaResponse votar(String emailUsuario, String indiceId) {
        Participante usuario = participantePorEmail(emailUsuario);
        VotacionIndice v = votacionAbiertaObligatoria();

        boolean yaVoto = v.getVotos().stream().anyMatch(voto -> voto.getPadreId().equals(usuario.getId()));
        if (yaVoto) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya votaste en esta votación");
        }
        boolean esOpcion = v.getOpciones().stream().anyMatch(o -> o.getIndice().equals(indiceId));
        if (!esOpcion) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esa opción no está en la votación");
        }

        v.getVotos().add(new VotacionIndice.Voto(usuario.getId(), indiceId, LocalDate.now()));
        return vistaDe(repository.save(v), usuario);
    }

    /** Solo ADMINISTRADOR (lo controla IndiceController). */
    public VotacionAbiertaResponse abrir(String emailAdministrador, NuevaVotacionRequest pedido) {
        Participante admin = participantePorEmail(emailAdministrador);
        int ciclo = cicloActual();
        if (repository.findByCicloLectivo(ciclo).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El ciclo " + ciclo + " ya tiene su votación: el índice no cambia durante el año");
        }

        Set<String> vistos = new HashSet<>();
        List<VotacionIndice.Opcion> opciones = pedido.opciones().stream().map(o -> validarOpcion(o, vistos)).toList();

        VotacionIndice v = new VotacionIndice();
        v.setCicloLectivo(ciclo);
        v.setEstado(VotacionIndice.ABIERTA);
        v.setCreadaPor(admin.getId());
        v.setFechaApertura(LocalDate.now());
        v.setOpciones(opciones);
        return vistaDe(repository.save(v), admin);
    }

    /**
     * Solo ADMINISTRADOR. La más votada queda fija para todo el ciclo.
     * Si hay empate, desempate tiene que ser una de las opciones empatadas.
     */
    public IndiceVigenteResponse cerrar(String desempate) {
        VotacionIndice v = votacionAbiertaObligatoria();

        List<ResultadoOpcion> resultados = resultados(v);
        int maximo = resultados.stream().mapToInt(ResultadoOpcion::votos).max().orElse(0);
        List<ResultadoOpcion> empatadas = resultados.stream().filter(r -> r.votos() == maximo).toList();

        ResultadoOpcion ganadora = empatadas.get(0);
        if (empatadas.size() > 1) {
            ganadora = empatadas.stream()
                    .filter(r -> r.indice().equals(desempate))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                            "Hay empate: elegí cuál de las opciones empatadas gana"));
        }

        v.setEstado(VotacionIndice.CERRADA);
        v.setFechaCierre(LocalDate.now());
        v.setIndiceElegido(ganadora.indice());
        v.setCantidadUnidades(ganadora.cantidadUnidades());
        VotacionIndice cerrada = repository.save(v);

        return new IndiceVigenteResponse(cerrada.getId(), cerrada.getIndiceElegido(),
                cerrada.getCantidadUnidades(), cerrada.getFechaCierre());
    }

    // ── Ayudas ──────────────────────────────────────────────────────────────

    /** El ciclo marcado como activo; si no hay ninguno, el año en curso. */
    int cicloActual() {
        return cicloLectivoRepository.findAll().stream()
                .filter(CicloLectivo::isActivo)
                .mapToInt(CicloLectivo::getAnio)
                .max()
                .orElse(LocalDate.now().getYear());
    }

    private Optional<VotacionIndice> votacionDelCiclo() {
        return repository.findByCicloLectivo(cicloActual());
    }

    private VotacionIndice votacionAbiertaObligatoria() {
        return votacionDelCiclo()
                .filter(v -> VotacionIndice.ABIERTA.equals(v.getEstado()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "No hay ninguna votación abierta"));
    }

    private Participante participantePorEmail(String email) {
        return participanteRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }

    private VotacionIndice.Opcion validarOpcion(OpcionRequest o, Set<String> vistos) {
        if (Indice.desdeId(o.indice()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Índice desconocido: " + o.indice());
        }
        if (!vistos.add(o.indice())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cada índice puede aparecer una sola vez");
        }
        return new VotacionIndice.Opcion(o.indice(), o.cantidadUnidades());
    }

    private static List<ResultadoOpcion> resultados(VotacionIndice v) {
        return v.getOpciones().stream()
                .map(o -> new ResultadoOpcion(o.getIndice(), o.getCantidadUnidades(),
                        (int) v.getVotos().stream().filter(voto -> voto.getIndice().equals(o.getIndice())).count()))
                .toList();
    }

    /** Lo que ve el usuario: conteos y su propio voto, no quién votó qué. */
    private VotacionAbiertaResponse vistaDe(VotacionIndice v, Participante usuario) {
        String creador = participanteRepository.findById(v.getCreadaPor())
                .map(p -> p.getNombre() + " " + p.getApellido())
                .orElse("Administración");
        String miVoto = v.getVotos().stream()
                .filter(voto -> voto.getPadreId().equals(usuario.getId()))
                .map(VotacionIndice.Voto::getIndice)
                .findFirst()
                .orElse(null);
        int participantes = participanteRepository.findByActivoTrue().size();

        return new VotacionAbiertaResponse(v.getId(), v.getCicloLectivo(), v.getFechaApertura(), creador,
                resultados(v), miVoto, v.getVotos().size(), participantes);
    }
}
