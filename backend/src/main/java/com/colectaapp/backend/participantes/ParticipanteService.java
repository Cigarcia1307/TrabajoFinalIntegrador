package com.colectaapp.backend.participantes;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipanteService {

    private final ParticipanteRepository repository;

    public ParticipanteService(ParticipanteRepository repository) {
        this.repository = repository;
    }

    public Participante crear(Participante participante) {
        participante.setId(null);
        participante.setActivo(true);
        return repository.save(participante);
    }

    public List<Participante> listarActivos() {
        return repository.findByActivoTrue();
    }

    public Participante buscarPorId(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Participante no encontrado"));
    }

    public Participante actualizar(String id, Participante datos) {
        Participante participante = buscarPorId(id);

        participante.setNombre(datos.getNombre());
        participante.setApellido(datos.getApellido());
        participante.setEmail(datos.getEmail());
        participante.setTelefono(datos.getTelefono());
        participante.setCbuAlias(datos.getCbuAlias());

        return repository.save(participante);
    }

    public Participante darDeBaja(String id) {
        Participante participante = buscarPorId(id);
        participante.setActivo(false);
        return repository.save(participante);
    }

    public Participante agregarBeneficiario(String id, Beneficiario beneficiario) {
        Participante participante = buscarPorId(id);
        participante.getHijos().add(beneficiario);
        return repository.save(participante);
    }
}