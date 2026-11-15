package com.colectaapp.backend.indices;

import com.colectaapp.backend.indices.cotizaciones.Cotizacion;
import com.colectaapp.backend.indices.cotizaciones.CotizacionCargadaService;
import com.colectaapp.backend.indices.cotizaciones.CotizacionService;
import com.colectaapp.backend.indices.dto.IndicesDtos.CargaCotizacionRequest;
import com.colectaapp.backend.indices.dto.IndicesDtos.CierreRequest;
import com.colectaapp.backend.indices.dto.IndicesDtos.IndiceResponse;
import com.colectaapp.backend.indices.dto.IndicesDtos.IndiceVigenteResponse;
import com.colectaapp.backend.indices.dto.IndicesDtos.NuevaVotacionRequest;
import com.colectaapp.backend.indices.dto.IndicesDtos.VotacionAbiertaResponse;
import com.colectaapp.backend.indices.dto.IndicesDtos.VotoRequest;
import com.colectaapp.backend.indices.votacion.VotacionIndiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

/**
 * Módulo 4 · Índices de Referencia. Endpoints documentados en el README.
 * Todos requieren sesión (SecurityConfig); los de administración, además, rol ADMINISTRADOR.
 */
@RestController
@RequestMapping("/api/indices")
public class IndiceController {

    private final CotizacionService cotizacionService;
    private final CotizacionCargadaService cotizacionCargadaService;
    private final VotacionIndiceService votacionService;

    public IndiceController(
            CotizacionService cotizacionService,
            CotizacionCargadaService cotizacionCargadaService,
            VotacionIndiceService votacionService) {
        this.cotizacionService = cotizacionService;
        this.cotizacionCargadaService = cotizacionCargadaService;
        this.votacionService = votacionService;
    }

    /** Catálogo de índices (nombre y unidad). */
    @GetMapping
    public List<IndiceResponse> listar() {
        return Arrays.stream(Indice.values())
                .map(i -> new IndiceResponse(i.getId(), i.getNombre(), i.getUnidad(), i.getUnidadPlural()))
                .toList();
    }

    /** Índice y cantidad elegidos para el ciclo actual. 404 si la votación todavía no cerró. */
    @GetMapping("/vigente")
    public IndiceVigenteResponse vigente() {
        return votacionService.vigente().orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Todavía no se eligió el índice de este ciclo"));
    }

    /** Votación abierta del ciclo, o 204 si no hay. */
    @GetMapping("/votacion")
    public ResponseEntity<VotacionAbiertaResponse> votacionAbierta(@AuthenticationPrincipal Jwt jwt) {
        return votacionService.abierta(jwt.getSubject())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/votar")
    public VotacionAbiertaResponse votar(@Valid @RequestBody VotoRequest pedido, @AuthenticationPrincipal Jwt jwt) {
        return votacionService.votar(jwt.getSubject(), pedido.indice());
    }

    @PostMapping("/votacion")
    @ResponseStatus(HttpStatus.CREATED)
    public VotacionAbiertaResponse abrirVotacion(
            @Valid @RequestBody NuevaVotacionRequest pedido, @AuthenticationPrincipal Jwt jwt) {
        exigirAdministrador(jwt);
        return votacionService.abrir(jwt.getSubject(), pedido);
    }

    @PostMapping("/votacion/cerrar")
    public IndiceVigenteResponse cerrarVotacion(
            @RequestBody(required = false) CierreRequest pedido, @AuthenticationPrincipal Jwt jwt) {
        exigirAdministrador(jwt);
        return votacionService.cerrar(pedido != null ? pedido.desempate() : null);
    }

    /** Valor de hoy de una unidad del índice, resuelto por su CotizacionStrategy. */
    @GetMapping("/{indice}/cotizacion-actual")
    public Cotizacion cotizacionActual(@PathVariable String indice) {
        return cotizacionService.obtenerCotizacionActual(indiceValido(indice));
    }

    /**
     * Solo ADMINISTRADOR: carga un precio a mano. Es la fuente de la Cajita Feliz
     * y el respaldo de los índices automáticos si su fuente falla.
     */
    @PostMapping("/{indice}/cotizaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public Cotizacion cargarCotizacion(
            @PathVariable String indice,
            @Valid @RequestBody CargaCotizacionRequest pedido,
            @AuthenticationPrincipal Jwt jwt) {
        exigirAdministrador(jwt);
        return cotizacionCargadaService.cargar(
                indiceValido(indice), pedido.valorUnitarioArs(), pedido.fecha(), jwt.getSubject());
    }

    // ── Ayudas ──────────────────────────────────────────────────────────────

    private static Indice indiceValido(String id) {
        return Indice.desdeId(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Índice desconocido: " + id));
    }

    /** El rol viaja en el token (claim "rol", ver auth/JwtService). */
    private static void exigirAdministrador(Jwt jwt) {
        if (!"ADMINISTRADOR".equals(jwt.getClaimAsString("rol"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo un administrador puede hacer esto");
        }
    }
}
