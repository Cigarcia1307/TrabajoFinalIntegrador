
package com.colectaapp.backend.congelamiento;

import com.colectaapp.backend.colectas.Colecta;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/precios-referencia")
public class PrecioReferenciaController {

    private final PrecioReferenciaRepository precioRepository;
    private final CongelamientoService congelamientoService;

    public PrecioReferenciaController(
            PrecioReferenciaRepository precioRepository,
            CongelamientoService congelamientoService) {

        this.precioRepository = precioRepository;
        this.congelamientoService = congelamientoService;
    }

    /**
     * GET /api/precios-referencia
     * Devuelve los precios de referencia ordenados por fecha.
     */
    @GetMapping
    public ResponseEntity<List<PrecioReferencia>> listar() {

        List<PrecioReferencia> precios =
                precioRepository.findAllByOrderByFechaDesc();

        return ResponseEntity.ok(precios);
    }

    /**
     * POST /api/precios-referencia/congelar/{colectaId}
     * Congela manualmente el monto de una colecta.
     */
    @PostMapping("/congelar/{colectaId}")
    public ResponseEntity<Colecta> congelar(
            @PathVariable String colectaId) {

        Colecta colecta =
                congelamientoService.congelar(colectaId);

        return ResponseEntity.ok(colecta);
    }
}
