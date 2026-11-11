package com.colectaapp.backend.colectas;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/colectas")
public class ColectaController {

    private final ColectaRepository colectaRepository;

    public ColectaController(ColectaRepository colectaRepository) {
        this.colectaRepository = colectaRepository;
    }

    @GetMapping
    public List<Colecta> listar(
            @RequestParam(required = false) Integer ciclo) {

        List<Colecta> colectas = colectaRepository.findAll();

        return colectas.stream()
                .filter(colecta -> colecta.isActivo())
                .filter(colecta ->
                        ciclo == null ||
                                colecta.getCicloLectivo() == ciclo)
                .sorted(java.util.Comparator.comparingInt(
                        Colecta::getOrdenEnLaRueda))
                .toList();
    }

    @GetMapping("/{id}")
    public Colecta obtenerPorId(@PathVariable String id) {
        return colectaRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Colecta no encontrada"
                        )
                );
    }

    @GetMapping("/{id}/recaudador")
    public String obtenerRecaudador(@PathVariable String id) {

        Colecta colecta = colectaRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Colecta no encontrada"
                        )
                );

        return colecta.getRecaudadorId();
    }
}