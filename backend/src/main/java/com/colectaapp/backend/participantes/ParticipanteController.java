package com.colectaapp.backend.participantes;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participantes")
public class ParticipanteController {

    private final ParticipanteService service;

    public ParticipanteController(ParticipanteService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Participante crear(@RequestBody Participante participante) {
        return service.crear(participante);
    }

    @GetMapping
    public List<Participante> listarActivos() {
        return service.listarActivos();
    }

    @GetMapping("/{id}")
    public Participante buscarPorId(@PathVariable String id) {
        return service.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public Participante actualizar(
            @PathVariable String id,
            @RequestBody Participante participante,
            @AuthenticationPrincipal Jwt jwt) {
        return service.actualizar(id, participante, jwt.getSubject());
    }

    @PatchMapping("/{id}/baja")
    public Participante darDeBaja(@PathVariable String id) {
        return service.darDeBaja(id);
    }

    @PostMapping("/{id}/beneficiarios")
    @ResponseStatus(HttpStatus.CREATED)
    public Participante agregarBeneficiario(
            @PathVariable String id,
            @RequestBody Beneficiario beneficiario,
            @AuthenticationPrincipal Jwt jwt) {
        return service.agregarBeneficiario(id, beneficiario, jwt.getSubject());
    }

    @PatchMapping("/{id}/beneficiarios/{indice}/solicitud-fecha")
    public Participante solicitarCambioFecha(
            @PathVariable String id,
            @PathVariable int indice,
            @RequestBody SolicitudCambioFecha solicitud,
            @AuthenticationPrincipal Jwt jwt) {
        return service.solicitarCambioFecha(
                id, indice, solicitud.fechaNacimiento(), jwt.getSubject());
    }

    @PatchMapping("/{id}/beneficiarios/{indice}/aprobar-fecha")
    public Participante aprobarCambioFecha(
            @PathVariable String id,
            @PathVariable int indice,
            @AuthenticationPrincipal Jwt jwt) {
        return service.aprobarCambioFecha(id, indice, jwt.getSubject());
    }

    @PatchMapping("/{id}/beneficiarios/{indice}/rechazar-fecha")
    public Participante rechazarCambioFecha(
            @PathVariable String id,
            @PathVariable int indice,
            @AuthenticationPrincipal Jwt jwt) {
        return service.rechazarCambioFecha(id, indice, jwt.getSubject());
    }

    public record SolicitudCambioFecha(java.time.LocalDate fechaNacimiento) {
    }
}