package com.colectaapp.backend.aportes;

import com.colectaapp.backend.aportes.AportesDtos.CambioAporte;
import com.colectaapp.backend.aportes.AportesDtos.ResumenColecta;
import com.colectaapp.backend.colectas.Colecta;
import com.colectaapp.backend.colectas.ColectaRepository;
import com.colectaapp.backend.participantes.Participante;
import com.colectaapp.backend.participantes.ParticipanteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Módulo 6 · Aportes y Pagos.
 *
 * REGLA DE VISIBILIDAD (README, "Decisiones de diseño cerradas"): dentro de una colecta,
 * cada participante ve SOLO su propio aporte; el recaudador de ESA colecta (recaudador_id)
 * ve el de todos y el resumen. Se compara el usuario logueado contra recaudador_id,
 * no contra un rol genérico, y se aplica siempre acá, en el backend.
 */
@Service
public class AporteService {

    private final ColectaRepository colectaRepository;
    private final ParticipanteRepository participanteRepository;

    public AporteService(ColectaRepository colectaRepository, ParticipanteRepository participanteRepository) {
        this.colectaRepository = colectaRepository;
        this.participanteRepository = participanteRepository;
    }

    // ── Consultas ───────────────────────────────────────────────────────────

    /**
     * Recaudador: todos los aportes. Participante: una lista con su único aporte
     * (vacía si es el padre del cumpleañero, que no aporta a su propia colecta).
     */
    public List<Aporte> obtenerAportes(String colectaId, String emailUsuario) {
        Colecta colecta = colectaConAportes(colectaId);
        String usuarioId = idDe(emailUsuario);
        if (esRecaudador(colecta, usuarioId)) {
            return colecta.getAportes();
        }
        return colecta.getAportes().stream().filter(a -> a.getPadreId().equals(usuarioId)).toList();
    }

    /** Solo el recaudador: recaudado vs. objetivo y conteos. */
    public ResumenColecta obtenerResumen(String colectaId, String emailUsuario) {
        Colecta colecta = colectaConAportes(colectaId);
        exigirRecaudador(colecta, idDe(emailUsuario), "Solo el recaudador ve el resumen");

        List<Aporte> aportes = colecta.getAportes();
        List<Aporte> participan = aportes.stream().filter(a -> Boolean.TRUE.equals(a.getParticipa())).toList();
        return new ResumenColecta(
                colecta.getId(),
                aportes.stream().mapToDouble(Aporte::getMontoPagado).sum(),
                colecta.getMontoTotalObjetivo(),
                participan.size(),
                (int) participan.stream().filter(Aporte::isPagado).count(),
                (int) participan.stream().filter(a -> !a.isPagado()).count(),
                (int) aportes.stream().filter(a -> a.getParticipa() == null).count());
    }

    /** Solo el recaudador: quiénes participan y todavía no pagaron. */
    public List<Aporte> obtenerDeudaPendiente(String colectaId, String emailUsuario) {
        Colecta colecta = colectaConAportes(colectaId);
        exigirRecaudador(colecta, idDe(emailUsuario), "Solo el recaudador ve la deuda pendiente");
        return colecta.getAportes().stream()
                .filter(a -> Boolean.TRUE.equals(a.getParticipa()) && !a.isPagado())
                .toList();
    }

    // ── Cambios ─────────────────────────────────────────────────────────────

    /**
     * - participa: lo decide cada uno sobre sí mismo (o el recaudador).
     * - pagado: solo lo marca el recaudador, y solo con el monto ya congelado.
     */
    public Aporte actualizar(String colectaId, String padreId, CambioAporte cambio, String emailUsuario) {
        Colecta colecta = colectaConAportes(colectaId);
        String usuarioId = idDe(emailUsuario);
        boolean recaudador = esRecaudador(colecta, usuarioId);

        if (!recaudador && !padreId.equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo podés modificar tu propio aporte");
        }
        if (cambio.pagado() != null && !recaudador) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el recaudador registra pagos");
        }
        if ("cerrada".equals(colecta.getEstadoColecta())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La colecta ya está cerrada");
        }
        if (Boolean.TRUE.equals(cambio.pagado()) && colecta.getMontoIndividualPesos() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El monto todavía no está congelado: no se pueden registrar pagos");
        }

        Aporte aporte = colecta.getAportes().stream()
                .filter(a -> a.getPadreId().equals(padreId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aporte no encontrado"));

        if (cambio.participa() != null) {
            aporte.setParticipa(cambio.participa());
            if (!cambio.participa()) {
                // Si decide no participar, no puede quedar como pagado.
                aporte.setPagado(false);
                aporte.setMontoPagado(0);
                aporte.setFechaPago(null);
            }
        }
        if (cambio.pagado() != null) {
            boolean pagado = cambio.pagado();
            aporte.setPagado(pagado);
            if (pagado) {
                aporte.setParticipa(true); // si pagó, participa
            }
            aporte.setMontoPagado(pagado ? colecta.getMontoIndividualPesos() : 0);
            aporte.setFechaPago(pagado ? LocalDate.now().toString() : null);
        }

        colectaRepository.save(colecta);
        return aporte;
    }

    // ── Ayudas ──────────────────────────────────────────────────────────────

    /**
     * La colecta con sus aportes completos. Las colectas que genera el Módulo 3 nacen
     * sin aportes: la primera vez que se consultan, se crea uno por cada participante
     * activo, menos el padre del cumpleañero (que no aporta a la colecta de su hijo).
     * Si después se suma un participante nuevo, también se le agrega su aporte.
     */
    private Colecta colectaConAportes(String colectaId) {
        Colecta colecta = colectaRepository.findById(colectaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Colecta no encontrada"));

        Set<String> yaTienen = colecta.getAportes().stream().map(Aporte::getPadreId).collect(Collectors.toSet());
        List<Aporte> faltantes = participanteRepository.findByActivoTrue().stream()
                .map(Participante::getId)
                .filter(id -> !id.equals(colecta.getPadreId()) && !yaTienen.contains(id))
                .map(Aporte::nuevo)
                .toList();

        // Solo en colectas abiertas: una colecta cerrada no suma participantes nuevos.
        if (!faltantes.isEmpty() && !"cerrada".equals(colecta.getEstadoColecta())) {
            colecta.getAportes().addAll(faltantes);
            colectaRepository.save(colecta);
        }
        return colecta;
    }

    private String idDe(String email) {
        return participanteRepository.findByEmail(email)
                .map(Participante::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }

    private static boolean esRecaudador(Colecta colecta, String usuarioId) {
        return usuarioId.equals(colecta.getRecaudadorId());
    }

    private static void exigirRecaudador(Colecta colecta, String usuarioId, String mensaje) {
        if (!esRecaudador(colecta, usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, mensaje);
        }
    }
}
