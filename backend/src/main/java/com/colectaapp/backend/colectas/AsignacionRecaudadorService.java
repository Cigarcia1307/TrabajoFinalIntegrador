package com.colectaapp.backend.colectas;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AsignacionRecaudadorService {

    public String asignarRecaudador(
            int posicionColecta,
            List<String> padresBeneficiariosIds,
            String primerVoluntarioId) {

        // La primera colecta la organiza el voluntario.
        if (posicionColecta == 0) {
            return primerVoluntarioId;
        }

        // Desde la segunda colecta,
        // recauda el padre del beneficiario de la colecta anterior.
        return padresBeneficiariosIds.get(posicionColecta - 1);
    }
}