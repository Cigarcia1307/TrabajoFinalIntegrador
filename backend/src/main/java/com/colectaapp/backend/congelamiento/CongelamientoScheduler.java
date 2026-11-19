package com.colectaapp.backend.congelamiento;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CongelamientoScheduler {

    private final CongelamientoService congelamientoService;

    public CongelamientoScheduler(
            CongelamientoService congelamientoService) {
        this.congelamientoService = congelamientoService;
    }

    @Scheduled(cron = "0 5 0 * * *", zone = "America/Argentina/Buenos_Aires")
    public void ejecutarCongelamientoDiario() {
        congelamientoService.congelarColectasDelDia();
    }
}