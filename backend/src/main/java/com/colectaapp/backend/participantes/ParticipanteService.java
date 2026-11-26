package com.colectaapp.backend.participantes;

import com.colectaapp.backend.auth.Rol;
import com.colectaapp.backend.colectas.CicloLectivo;
import com.colectaapp.backend.colectas.CicloLectivoRepository;
import com.colectaapp.backend.colectas.Colecta;
import com.colectaapp.backend.colectas.ColectaRepository;
import com.colectaapp.backend.congelamiento.PrecioReferenciaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class ParticipanteService {

    private final ParticipanteRepository repository;
    private final CicloLectivoRepository cicloRepository;
    private final ColectaRepository colectaRepository;
    private final PrecioReferenciaRepository precioRepository;

    public ParticipanteService(
            ParticipanteRepository repository,
            CicloLectivoRepository cicloRepository,
            ColectaRepository colectaRepository,
            PrecioReferenciaRepository precioRepository) {
        this.repository = repository;
        this.cicloRepository = cicloRepository;
        this.colectaRepository = colectaRepository;
        this.precioRepository = precioRepository;
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
        Participante usuario = exigirPropietarioOAdministrador(id, emailUsuario);
        Participante participante = buscarPorId(id);

        participante.setNombre(datos.getNombre());
        participante.setApellido(datos.getApellido());
        participante.setEmail(datos.getEmail());
        participante.setTelefono(datos.getTelefono());
        participante.setCbuAlias(datos.getCbuAlias());

        if (datos.getHijos() != null) {
            if (usuario.getRol() == Rol.ADMINISTRADOR) {
                sincronizarCambiosAdministrativos(participante, datos.getHijos());
                participante.setHijos(datos.getHijos());
                participante.getHijos().forEach(hijo -> hijo.setFechaNacimientoSolicitada(null));
            } else {
                registrarSolicitudesDeFechas(participante, datos.getHijos());
            }
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

    public Participante solicitarCambioFecha(
            String id, int indice, LocalDate fechaSolicitada, String emailUsuario) {
        exigirPropietarioOAdministrador(id, emailUsuario);
        exigirFecha(fechaSolicitada);
        Participante participante = buscarPorId(id);
        Beneficiario beneficiario = obtenerBeneficiario(participante, indice);
        if (beneficiario.getFechaNacimiento().equals(fechaSolicitada)) {
            beneficiario.setFechaNacimientoSolicitada(null);
        } else {
            beneficiario.setFechaNacimientoSolicitada(fechaSolicitada);
        }
        return repository.save(participante);
    }

    public Participante aprobarCambioFecha(String id, int indice, String emailUsuario) {
        exigirAdministrador(emailUsuario);
        Participante participante = buscarPorId(id);
        Beneficiario beneficiario = obtenerBeneficiario(participante, indice);
        LocalDate fechaSolicitada = beneficiario.getFechaNacimientoSolicitada();
        if (fechaSolicitada == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No hay un cambio de fecha pendiente");
        }

        sincronizarFechaColecta(participante, beneficiario, fechaSolicitada);
        beneficiario.setFechaNacimiento(fechaSolicitada);
        beneficiario.setFechaNacimientoSolicitada(null);
        return repository.save(participante);
    }

    public Participante rechazarCambioFecha(String id, int indice, String emailUsuario) {
        exigirAdministrador(emailUsuario);
        Participante participante = buscarPorId(id);
        Beneficiario beneficiario = obtenerBeneficiario(participante, indice);
        if (beneficiario.getFechaNacimientoSolicitada() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No hay un cambio de fecha pendiente");
        }
        beneficiario.setFechaNacimientoSolicitada(null);
        return repository.save(participante);
    }

    private void sincronizarCambiosAdministrativos(
            Participante participante, List<Beneficiario> hijosActualizados) {
        for (int indice = 0; indice < Math.min(participante.getHijos().size(), hijosActualizados.size()); indice++) {
            Beneficiario anterior = participante.getHijos().get(indice);
            Beneficiario actualizado = hijosActualizados.get(indice);
            exigirFecha(actualizado.getFechaNacimiento());
            if (!anterior.getFechaNacimiento().equals(actualizado.getFechaNacimiento())) {
                sincronizarFechaColecta(participante, anterior, actualizado.getFechaNacimiento());
            }
        }
    }

    private void registrarSolicitudesDeFechas(
            Participante participante, List<Beneficiario> hijosEnviados) {
        if (hijosEnviados.size() != participante.getHijos().size()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo un administrador puede agregar o quitar beneficiarios");
        }
        for (int indice = 0; indice < hijosEnviados.size(); indice++) {
            Beneficiario actual = participante.getHijos().get(indice);
            Beneficiario enviado = hijosEnviados.get(indice);
            if (!actual.getNombre().equals(enviado.getNombre())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Solo un administrador puede modificar los nombres de los beneficiarios");
            }
            exigirFecha(enviado.getFechaNacimiento());
            if (!actual.getFechaNacimiento().equals(enviado.getFechaNacimiento())) {
                actual.setFechaNacimientoSolicitada(enviado.getFechaNacimiento());
            }
        }
    }

    private void sincronizarFechaColecta(
            Participante participante, Beneficiario beneficiario, LocalDate nuevaFecha) {
        CicloLectivo cicloActivo = cicloRepository.findAll().stream()
                .filter(CicloLectivo::isActivo)
                .max(java.util.Comparator.comparingInt(CicloLectivo::getAnio))
                .orElse(null);
        if (cicloActivo == null) {
            return;
        }

        for (Colecta colecta : colectaRepository.findByCicloLectivo(cicloActivo.getAnio())) {
            if (!colecta.isActivo()
                    || !"en_recaudacion".equals(colecta.getEstadoColecta())
                    || !participante.getId().equals(colecta.getPadreId())
                    || !beneficiario.getNombre().equals(colecta.getBeneficiarioNombre())) {
                continue;
            }
            boolean yaHuboAportes = colecta.getAportes() != null && colecta.getAportes().stream()
                    .anyMatch(aporte -> aporte.isPagado() || aporte.getMontoPagado() > 0);
            if (yaHuboAportes) {
                continue;
            }

            colecta.setFechaCumpleanos(nuevaFecha.withYear(cicloActivo.getAnio()));
            precioRepository.findByColectaId(colecta.getId()).ifPresent(precioRepository::delete);
            colecta.setMontoIndividualPesos(0);
            colecta.setIndiceReferencia(null);
            colecta.setCantidadUnidades(null);
            colectaRepository.save(colecta);
        }
    }

    private Beneficiario obtenerBeneficiario(Participante participante, int indice) {
        if (indice < 0 || indice >= participante.getHijos().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el beneficiario");
        }
        return participante.getHijos().get(indice);
    }

    private void exigirFecha(LocalDate fecha) {
        if (fecha == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha de nacimiento es obligatoria");
        }
    }

    private Participante exigirPropietarioOAdministrador(String id, String emailUsuario) {
        Participante usuario = repository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuario no encontrado"));

        if (usuario.getRol() != Rol.ADMINISTRADOR && !usuario.getId().equals(id)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo podés modificar tu propia información");
        }
        return usuario;
    }

    private void exigirAdministrador(String emailUsuario) {
        Participante usuario = repository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
        if (usuario.getRol() != Rol.ADMINISTRADOR) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Solo un administrador puede resolver solicitudes");
        }
    }
}