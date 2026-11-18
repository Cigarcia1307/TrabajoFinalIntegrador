
package com.colectaapp.backend.colectas;

import com.colectaapp.backend.participantes.ParticipanteRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PostulacionVoluntarioService {

    private final PostulacionVoluntarioRepository postulacionRepository;
    private final ParticipanteRepository participanteRepository;
    private final ColectaRepository colectaRepository;

    public PostulacionVoluntarioService(
            PostulacionVoluntarioRepository postulacionRepository,
            ParticipanteRepository participanteRepository,
            ColectaRepository colectaRepository) {

        this.postulacionRepository = postulacionRepository;
        this.participanteRepository = participanteRepository;
        this.colectaRepository = colectaRepository;
    }

    public PostulacionVoluntario postularse(
            int anio, String participanteId) {

        // No permitir postulaciones si la rueda ya fue generada.
        if (colectaRepository.existsByCicloLectivo(anio)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La rueda de este ciclo ya fue generada"
            );
        }

        // Comprobar que el participante exista.
        var participante = participanteRepository
                .findById(participanteId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Participante no encontrado"
                ));

        // Solo pueden postularse participantes activos.
        if (!participante.isActivo()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El participante no está activo"
            );
        }

        // Evitar que un participante se postule dos veces.
        if (postulacionRepository
                .existsByCicloLectivoAndParticipanteId(
                        anio, participanteId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya estás postulado para este ciclo"
            );
        }

        // Consultar las postulaciones existentes.
        var postulaciones =
                postulacionRepository.findByCicloLectivo(anio);

        // Máximo dos voluntarios: titular y suplente.
        if (postulaciones.size() >= 2) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya hay 2 postulados: titular y suplente. Cupo completo"
            );
        }

        // El primero es titular; el segundo, suplente.
        String rol = postulaciones.isEmpty()
                ? "TITULAR"
                : "SUPLENTE";

        PostulacionVoluntario postulacion =
                new PostulacionVoluntario(
                        null,
                        anio,
                        participanteId,
                        rol,
                        LocalDateTime.now()
                );

        // Guardar y controlar conflictos del índice único.
        try {
            return postulacionRepository.save(postulacion);

        } catch (DuplicateKeyException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Otro participante ocupó ese lugar. Volvé a intentar la postulación."
            );
        }
    }

    // Consultar si un participante ya está postulado.
    public Optional<PostulacionVoluntario> obtenerPostulacion(
            int anio, String participanteId) {

        return postulacionRepository
                .findByCicloLectivoAndParticipanteId(
                        anio, participanteId
                );
    }
}
