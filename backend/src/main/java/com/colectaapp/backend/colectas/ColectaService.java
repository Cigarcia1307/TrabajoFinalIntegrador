package com.colectaapp.backend.colectas;

import com.colectaapp.backend.participantes.ParticipanteRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;

@Service
public class ColectaService {

    private final ColectaRepository colectaRepository;
    private final CicloLectivoRepository cicloLectivoRepository;
    private final ParticipanteRepository participanteRepository;
    private final AsignacionRecaudadorService asignacionRecaudadorService;

    public ColectaService(
            ColectaRepository colectaRepository,
            CicloLectivoRepository cicloLectivoRepository,
            ParticipanteRepository participanteRepository,
            AsignacionRecaudadorService asignacionRecaudadorService) {

        this.colectaRepository = colectaRepository;
        this.cicloLectivoRepository = cicloLectivoRepository;
        this.participanteRepository = participanteRepository;
        this.asignacionRecaudadorService = asignacionRecaudadorService;
    }

    public void generarColectas(int anio, String primerVoluntarioId) {

        cicloLectivoRepository.findByAnio(anio)
                .orElseGet(() -> cicloLectivoRepository.save(
                        new CicloLectivo(null, anio, true)
                ));

        if (colectaRepository.existsByCicloLectivo(anio)) {
            return;
        }

        var participantes = participanteRepository.findByActivoTrue();

        var datosColectas = new ArrayList<DatosColecta>();

        for (var participante : participantes) {
            for (var beneficiario : participante.getHijos()) {
                datosColectas.add(new DatosColecta(
                        participante.getId(),
                        beneficiario.getNombre(),
                        beneficiario.getFechaNacimiento()
                ));
            }
        }

        datosColectas.sort(
                Comparator.comparing(DatosColecta::fechaNacimiento)
        );

        var padresBeneficiariosIds = datosColectas.stream()
                .map(DatosColecta::padreId)
                .toList();

        for (int i = 0; i < datosColectas.size(); i++) {

            var datos = datosColectas.get(i);

            Colecta colecta = new Colecta();

            colecta.setCicloLectivo(anio);
            colecta.setBeneficiarioNombre(datos.beneficiarioNombre());
            colecta.setFechaCumpleanos(datos.fechaNacimiento());
            colecta.setPadreId(datos.padreId());

            String recaudadorId =
                    asignacionRecaudadorService.asignarRecaudador(
                            i,
                            padresBeneficiariosIds,
                            primerVoluntarioId
                    );

            colecta.setRecaudadorId(recaudadorId);
            colecta.setEsPrimeraVoluntaria(i == 0);
            colecta.setEstadoColecta("en_recaudacion");
            colecta.setActivo(true);
            colecta.setOrdenEnLaRueda(i + 1);

            colectaRepository.save(colecta);
        }
    }

    private record DatosColecta(
            String padreId,
            String beneficiarioNombre,
            java.time.LocalDate fechaNacimiento) {
    }
}