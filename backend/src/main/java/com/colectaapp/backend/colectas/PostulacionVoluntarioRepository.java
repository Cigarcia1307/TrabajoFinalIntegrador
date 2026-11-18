
package com.colectaapp.backend.colectas;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PostulacionVoluntarioRepository
        extends MongoRepository<PostulacionVoluntario, String> {

    List<PostulacionVoluntario> findByCicloLectivo(int cicloLectivo);

    boolean existsByCicloLectivoAndParticipanteId(
            int cicloLectivo,
            String participanteId
    );

    Optional<PostulacionVoluntario> findByCicloLectivoAndParticipanteId(
            int cicloLectivo,
            String participanteId
    );
}
