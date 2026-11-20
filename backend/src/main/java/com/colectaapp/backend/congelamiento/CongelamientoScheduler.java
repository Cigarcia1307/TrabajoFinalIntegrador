package com.colectaapp.backend.congelamiento;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;

@Component
public class CongelamientoScheduler {

    private static final Logger log = LoggerFactory.getLogger(CongelamientoScheduler.class);
    private static final ZoneId ZONA_HORARIA = ZoneId.of("America/Argentina/Buenos_Aires");

    private final CongelamientoService congelamientoService;

    public CongelamientoScheduler(
            CongelamientoService congelamientoService) {
        this.congelamientoService = congelamientoService;
    }

    @Scheduled(cron = "0 55 23 * * *", zone = "America/Argentina/Buenos_Aires")
    public void archivarCotizacionDiaria() {
        LocalDate hoy = LocalDate.now(ZONA_HORARIA);
        try {
            congelamientoService.archivarCotizacionDelCicloActivo(hoy);
        } catch (ResponseStatusException | DataAccessException e) {
            log.error("No se pudo archivar la cotización diaria del índice vigente", e);
        }
        try {
            congelamientoService.congelarColectasPendientes(hoy);
        } catch (DataAccessException e) {
            log.error("No se pudieron procesar las colectas pendientes", e);
        }
    }

    @Scheduled(cron = "0 5 0 * * *", zone = "America/Argentina/Buenos_Aires")
    public void ejecutarCongelamientoDiario() {
        congelamientoService.congelarColectasDelDia();
    }
}