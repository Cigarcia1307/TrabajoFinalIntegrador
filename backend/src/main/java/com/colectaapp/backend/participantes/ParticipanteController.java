package com.colectaapp.backend.participantes;

import org.springframework.http.HttpStatus;
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
            @RequestBody Participante participante) {
        return service.actualizar(id, participante);
    }

    @PatchMapping("/{id}/baja")
    public Participante darDeBaja(@PathVariable String id) {
        return service.darDeBaja(id);
    }

    @PostMapping("/{id}/beneficiarios")
    @ResponseStatus(HttpStatus.CREATED)
    public Participante agregarBeneficiario(
            @PathVariable String id,
            @RequestBody Beneficiario beneficiario) {
        return service.agregarBeneficiario(id, beneficiario);
    }
}