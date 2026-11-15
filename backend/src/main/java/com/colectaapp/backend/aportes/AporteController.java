package com.colectaapp.backend.aportes;

import com.colectaapp.backend.aportes.AportesDtos.CambioAporte;
import com.colectaapp.backend.aportes.AportesDtos.ResumenColecta;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Módulo 6 · Aportes y Pagos. Endpoints documentados en el README.
 * Quién pide se identifica por el email del token (jwt.getSubject()); la regla de
 * visibilidad la aplica AporteService.
 */
@RestController
@RequestMapping("/api/colectas/{colectaId}")
public class AporteController {

    private final AporteService aporteService;

    public AporteController(AporteService aporteService) {
        this.aporteService = aporteService;
    }

    /** Recaudador: todos los aportes · participante: solo el suyo. */
    @GetMapping("/aportes")
    public List<Aporte> listar(@PathVariable String colectaId, @AuthenticationPrincipal Jwt jwt) {
        return aporteService.obtenerAportes(colectaId, jwt.getSubject());
    }

    /** Decisión de participación y/o registro de pago. */
    @PatchMapping("/aportes/{padreId}")
    public Aporte actualizar(
            @PathVariable String colectaId,
            @PathVariable String padreId,
            @RequestBody CambioAporte cambio,
            @AuthenticationPrincipal Jwt jwt) {
        return aporteService.actualizar(colectaId, padreId, cambio, jwt.getSubject());
    }

    /** Solo el recaudador. */
    @GetMapping("/resumen")
    public ResumenColecta resumen(@PathVariable String colectaId, @AuthenticationPrincipal Jwt jwt) {
        return aporteService.obtenerResumen(colectaId, jwt.getSubject());
    }

    /** Solo el recaudador: quiénes participan y no pagaron. */
    @GetMapping("/deuda-pendiente")
    public List<Aporte> deudaPendiente(@PathVariable String colectaId, @AuthenticationPrincipal Jwt jwt) {
        return aporteService.obtenerDeudaPendiente(colectaId, jwt.getSubject());
    }
}
