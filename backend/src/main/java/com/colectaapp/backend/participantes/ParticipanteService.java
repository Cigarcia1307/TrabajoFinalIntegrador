package com.colectaapp.backend.participantes;

import com.colectaapp.backend.auth.Rol;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public Participante actualizar(String id, Participante datos, String emailUsuario) {
        exigirPropietarioOAdministrador(id, emailUsuario);
        Participante participante = buscarPorId(id);

        participante.setNombre(datos.getNombre());
        participante.setApellido(datos.getApellido());
        participante.setEmail(datos.getEmail());
        participante.setTelefono(datos.getTelefono());
        participante.setCbuAlias(datos.getCbuAlias());

        // Actualiza también los hijos del participante.
        // Se reemplaza la lista existente por la lista enviada
        // desde el formulario de edición.
        if (datos.getHijos() != null) {
            participante.setHijos(datos.getHijos());
        }

        return repository.save(participante);
    }

    public Participante darDeBaja(String id) {
        Participante participante = buscarPorId(id);
        participante.setActivo(false);
        return repository.save(participante);
    }

    public Participante agregarBeneficiario(
            String id,
            Beneficiario beneficiario,
            String emailUsuario) {
        exigirPropietarioOAdministrador(id, emailUsuario);
        Participante participante = buscarPorId(id);
        participante.getHijos().add(beneficiario);
        return repository.save(participante);
    }

    private void exigirPropietarioOAdministrador(String id, String emailUsuario) {
        Participante usuario = repository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuario no encontrado"));

        if (usuario.getRol() != Rol.ADMINISTRADOR && !usuario.getId().equals(id)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo podés modificar tu propia información");
        }
    }
}