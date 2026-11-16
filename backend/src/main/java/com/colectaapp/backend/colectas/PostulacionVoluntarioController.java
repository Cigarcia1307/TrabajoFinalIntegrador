
package com.colectaapp.backend.colectas;

import com.colectaapp.backend.participantes.ParticipanteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/voluntarios")
public class PostulacionVoluntarioController {

    private final PostulacionVoluntarioService service;
    private final ParticipanteRepository participanteRepository;

    public PostulacionVoluntarioController(
            PostulacionVoluntarioService service,
            ParticipanteRepository participanteRepository) {

        this.service = service;
        this.participanteRepository = participanteRepository;
    }

    @PostMapping("/{anio}")
    @ResponseStatus(HttpStatus.CREATED)
    public PostulacionVoluntario postularse(
            @PathVariable int anio,
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debés iniciar sesión para postularte"
            );
        }

        String email = jwt.getSubject();

        var participante = participanteRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Participante no encontrado"
                ));

        return service.postularse(anio, participante.getId());
    }
}
