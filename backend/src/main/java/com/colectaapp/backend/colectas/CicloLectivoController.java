package com.colectaapp.backend.colectas;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ciclos")
public class CicloLectivoController {

    private final CicloLectivoRepository cicloLectivoRepository;
    private final ColectaService colectaService;

    public CicloLectivoController(
            CicloLectivoRepository cicloLectivoRepository,
            ColectaService colectaService) {

        this.cicloLectivoRepository = cicloLectivoRepository;
        this.colectaService = colectaService;
    }

    @GetMapping
    public List<CicloLectivo> listar() {
        return cicloLectivoRepository.findAll();
    }

    @PostMapping("/{anio}")
    @ResponseStatus(HttpStatus.CREATED)
    public void crearCiclo(
            @PathVariable int anio,
            @RequestParam String primerVoluntarioId) {

        colectaService.generarColectas(anio, primerVoluntarioId);
    }
}