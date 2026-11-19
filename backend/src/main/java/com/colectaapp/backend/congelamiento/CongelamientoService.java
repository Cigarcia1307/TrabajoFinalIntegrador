
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
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
public class CongelamientoService {

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

                Colecta colecta = colectaRepository.findById(colectaId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "No se encontró la colecta"));

                if (yaEstaCongelada(colecta)) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "La colecta ya tiene un monto congelado");
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

                Cotizacion cotizacion = cotizacionService.obtenerCotizacionActual(indice);

                if (cotizacion.valorUnitarioArs() <= 0) {
                        throw new ResponseStatusException(
                                        HttpStatus.SERVICE_UNAVAILABLE,
                                        "La cotización no tiene un valor válido");
                }

                double unidades = votacion.getCantidadUnidades();

                double monto = Math.round(
                                unidades * cotizacion.valorUnitarioArs() * 100.0) / 100.0;

                PrecioReferencia referencia = new PrecioReferencia(
                                null,
                                colecta.getId(),
                                cotizacion.indice(),
                                cotizacion.fecha(),
                                cotizacion.valorUnitarioArs());

                // Persistir el histórico antes de actualizar la colecta.
                precioRepository.save(referencia);

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

                LocalDate hoy = LocalDate.now();

                CicloLectivo ciclo = cicloLectivoRepository.findAll()
                                .stream()
                                .filter(CicloLectivo::isActivo)
                                .max(java.util.Comparator.comparingInt(
                                                CicloLectivo::getAnio))
                                .orElse(null);

                if (ciclo == null) {
                        return;
                }

                List<Colecta> colectas = colectaRepository.findByCicloLectivo(ciclo.getAnio());

                for (Colecta colecta : colectas) {

                        if (!colecta.isActivo()
                                        || colecta.getFechaCumpleanos() == null
                                        || yaEstaCongelada(colecta)) {
                                continue;
                        }

                        LocalDate fechaCongelamiento = calcularDiaCongelamiento(colecta.getFechaCumpleanos());

                        if (fechaCongelamiento.equals(hoy)) {
                                try {
                                        congelar(colecta.getId());
                                } catch (ResponseStatusException e) {
                                        // Registrar el error permite continuar con las demás colectas.
                                        System.err.println(
                                                        "No se pudo congelar la colecta "
                                                                        + colecta.getId() + ": " + e.getReason());
                                }
                        }
                }
        }
}
