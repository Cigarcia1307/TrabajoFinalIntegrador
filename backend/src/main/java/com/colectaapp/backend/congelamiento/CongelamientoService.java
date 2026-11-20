
package com.colectaapp.backend.congelamiento;

import com.colectaapp.backend.colectas.Colecta;
import com.colectaapp.backend.colectas.ColectaRepository;
import com.colectaapp.backend.colectas.CicloLectivo;
import com.colectaapp.backend.colectas.CicloLectivoRepository;
import com.colectaapp.backend.indices.Indice;
import com.colectaapp.backend.indices.cotizaciones.Cotizacion;
import com.colectaapp.backend.indices.cotizaciones.CotizacionService;
import com.colectaapp.backend.indices.votacion.VotacionIndice;
import com.colectaapp.backend.indices.votacion.VotacionIndiceRepository;

import org.springframework.http.HttpStatus;
import org.springframework.dao.DuplicateKeyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
public class CongelamientoService {

        private static final Logger log = LoggerFactory.getLogger(CongelamientoService.class);
        private static final ZoneId ZONA_HORARIA = ZoneId.of("America/Argentina/Buenos_Aires");

        private final ColectaRepository colectaRepository;
        private final CicloLectivoRepository cicloLectivoRepository;
        private final VotacionIndiceRepository votacionRepository;
        private final CotizacionService cotizacionService;
        private final PrecioReferenciaRepository precioRepository;

        public CongelamientoService(
                        ColectaRepository colectaRepository,
                        CicloLectivoRepository cicloLectivoRepository,
                        VotacionIndiceRepository votacionRepository,
                        CotizacionService cotizacionService,
                        PrecioReferenciaRepository precioRepository) {

                this.colectaRepository = colectaRepository;
                this.cicloLectivoRepository = cicloLectivoRepository;
                this.votacionRepository = votacionRepository;
                this.cotizacionService = cotizacionService;
                this.precioRepository = precioRepository;
        }

        /**
         * Congela el monto individual de una colecta.
         */
        public Colecta congelar(String colectaId) {
                return congelar(colectaId, LocalDate.now(ZONA_HORARIA));
        }

        Colecta congelar(String colectaId, LocalDate fechaReal) {

                Colecta colecta = colectaRepository.findById(colectaId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "No se encontró la colecta"));

                if (yaEstaCongelada(colecta)
                                || precioRepository.findByColectaId(colectaId).isPresent()) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "La colecta ya tiene un monto congelado");
                }

                if (colecta.getFechaCumpleanos() == null) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "La colecta no tiene fecha de cumpleaños");
                }

                LocalDate fechaPrevista = calcularDiaCongelamiento(colecta.getFechaCumpleanos());
                if (fechaPrevista.isAfter(fechaReal)) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Todavía no llegó la fecha prevista para congelar la colecta");
                }

                VotacionIndice votacion = votacionRepository
                                .findByCicloLectivo(colecta.getCicloLectivo())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.BAD_REQUEST,
                                                "No existe una votación para este ciclo"));

                if (!VotacionIndice.CERRADA.equals(votacion.getEstado())) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "La votación todavía no está cerrada");
                }

                if (votacion.getIndiceElegido() == null
                                || votacion.getCantidadUnidades() == null
                                || votacion.getCantidadUnidades() <= 0) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "La votación no tiene un resultado válido");
                }

                Indice indice = Indice.desdeId(votacion.getIndiceElegido())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.BAD_REQUEST,
                                                "El índice elegido no es válido"));

                Cotizacion cotizacion = cotizacionService.obtenerCotizacionHistorica(indice, fechaPrevista);

                if (!fechaPrevista.equals(cotizacion.fecha())
                                || cotizacion.valorUnitarioArs() <= 0) {
                        throw new ResponseStatusException(
                                        HttpStatus.SERVICE_UNAVAILABLE,
                                        "No hay una cotización histórica válida para la fecha prevista");
                }

                double unidades = votacion.getCantidadUnidades();

                double monto = Math.round(
                                unidades * cotizacion.valorUnitarioArs() * 100.0) / 100.0;

                PrecioReferencia referencia = new PrecioReferencia(
                                null,
                                colecta.getId(),
                                cotizacion.indice(),
                                cotizacion.fecha(),
                                cotizacion.valorUnitarioArs(),
                                fechaPrevista,
                                fechaReal);

                try {
                        // El índice único arbitra carreras entre scheduler y congelamiento manual.
                        precioRepository.save(referencia);
                } catch (DuplicateKeyException e) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "La colecta ya tiene un monto congelado",
                                        e);
                }

                colecta.setIndiceReferencia(indice.getId());
                colecta.setCantidadUnidades(unidades);
                colecta.setMontoIndividualPesos(monto);

                return colectaRepository.save(colecta);
        }

        private boolean yaEstaCongelada(Colecta colecta) {
                return colecta.getMontoIndividualPesos() > 0
                                && colecta.getIndiceReferencia() != null
                                && colecta.getCantidadUnidades() != null;
        }

        /**
         * Devuelve el día hábil anterior al cumpleaños.
         */
        public LocalDate calcularDiaCongelamiento(LocalDate cumpleanos) {

                LocalDate fecha = cumpleanos.minusDays(1);

                while (fecha.getDayOfWeek() == DayOfWeek.SATURDAY
                                || fecha.getDayOfWeek() == DayOfWeek.SUNDAY) {

                        fecha = fecha.minusDays(1);
                }

                return fecha;
        }

        /**
         * Busca las colectas del ciclo activo que deben congelarse hoy.
         */
        public void congelarColectasDelDia() {
                congelarColectasPendientes(LocalDate.now(ZONA_HORARIA));
        }

        void congelarColectasPendientes(LocalDate hoy) {

                CicloLectivo ciclo = cicloActivo();
                if (ciclo == null) {
                        return;
                }

                List<Colecta> colectas = colectaRepository.findByCicloLectivo(ciclo.getAnio());

                for (Colecta colecta : colectas) {

                        if (!colecta.isActivo()
                                        || colecta.getFechaCumpleanos() == null
                                        || yaEstaCongelada(colecta)
                                        || precioRepository.findByColectaId(colecta.getId()).isPresent()) {
                                continue;
                        }

                        LocalDate fechaPrevista = calcularDiaCongelamiento(colecta.getFechaCumpleanos());
                        if (!fechaPrevista.isAfter(hoy)) {
                                try {
                                        congelar(colecta.getId(), hoy);
                                } catch (ResponseStatusException e) {
                                        log.warn("No se pudo congelar la colecta {}: {}",
                                                        colecta.getId(), e.getReason());
                                }
                        }
                }
        }

        /**
         * Archiva la cotización entregada por la fuente en su fecha real, antes de
         * que se necesite para congelar colectas.
         */
        void archivarCotizacionDelCicloActivo(LocalDate hoy) {
                CicloLectivo ciclo = cicloActivo();
                if (ciclo == null) {
                        return;
                }

                Optional<VotacionIndice> votacion = votacionRepository.findByCicloLectivo(ciclo.getAnio());
                if (votacion.isEmpty()
                                || !VotacionIndice.CERRADA.equals(votacion.get().getEstado())
                                || votacion.get().getIndiceElegido() == null) {
                        return;
                }

                Indice indice = Indice.desdeId(votacion.get().getIndiceElegido())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.BAD_REQUEST,
                                                "El índice elegido no es válido"));
                cotizacionService.archivarCotizacionDisponible(indice, hoy);
        }

        private CicloLectivo cicloActivo() {
                CicloLectivo ciclo = cicloLectivoRepository.findAll()
                                .stream()
                                .filter(CicloLectivo::isActivo)
                                .max(java.util.Comparator.comparingInt(
                                                CicloLectivo::getAnio))
                                .orElse(null);

                return ciclo;
        }
}
