package com.colectaapp.backend.auth;

import com.colectaapp.backend.auth.dto.AuthResponse;
import com.colectaapp.backend.auth.dto.InvitacionRequest;
import com.colectaapp.backend.auth.dto.LoginRequest;
import com.colectaapp.backend.auth.dto.RegistroRequest;
import com.colectaapp.backend.participantes.Participante;
import com.colectaapp.backend.participantes.ParticipanteRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ParticipanteRepository participanteRepository;
    private final InvitacionService invitacionService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final InvitacionRepository invitacionRepository;

    public AuthController(
            ParticipanteRepository participanteRepository,
            InvitacionService invitacionService,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            InvitacionRepository invitacionRepository) {

        this.participanteRepository = participanteRepository;
        this.invitacionService = invitacionService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.invitacionRepository = invitacionRepository;
    }

    @PostMapping("/invitaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public Invitacion crearInvitacion(
            @Valid @RequestBody InvitacionRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String administrador = jwt.getSubject();

        return invitacionService.crearInvitacion(email, administrador);
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registrar(
            @Valid @RequestBody RegistroRequest request) {

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        Invitacion invitacion =
                invitacionService.validarInvitacion(
                        request.tokenInvitacion());

        if (invitacion.getEmail() == null
                || !invitacion.getEmail().trim()
                .equalsIgnoreCase(email)) {
            throw new IllegalArgumentException(
                    "El email no coincide con el de la invitación.");
        }

        if (participanteRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(
                    "Ya existe una cuenta registrada con ese email.");
        }

        Participante participante = new Participante();
        participante.setNombre(request.nombre().trim());
        participante.setApellido(request.apellido().trim());
        participante.setEmail(email);
        participante.setTelefono(request.telefono());
        participante.setCbuAlias(request.cbuAlias());
        participante.setPassword(
                passwordEncoder.encode(request.password()));
        participante.setRol(Rol.PARTICIPANTE);
        participante.setActivo(true);

        participante = participanteRepository.save(participante);

        invitacion.setUtilizada(true);
        invitacionRepository.save(invitacion);

        String token = jwtService.generarToken(
                participante.getEmail(),
                participante.getRol());

        return new AuthResponse(
                token,
                "Bearer",
                participante.getEmail(),
                participante.getNombre(),
                participante.getRol().name());
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        Participante participante =
                participanteRepository.findByEmail(email)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Email o contraseña incorrectos."));

        if (!participante.isActivo()
                || participante.getPassword() == null
                || !passwordEncoder.matches(
                request.password(),
                participante.getPassword())) {
            throw new IllegalArgumentException(
                    "Email o contraseña incorrectos.");
        }

        String token = jwtService.generarToken(
                participante.getEmail(),
                participante.getRol());

        return new AuthResponse(
                token,
                "Bearer",
                participante.getEmail(),
                participante.getNombre(),
                participante.getRol().name());
    }

    @GetMapping("/me")
    public AuthResponse obtenerUsuarioActual(
            @AuthenticationPrincipal Jwt jwt) {

        String email = jwt.getSubject();

        Participante participante =
                participanteRepository.findByEmail(email)
                        .filter(Participante::isActivo)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "El usuario no existe o está inactivo."));

        return new AuthResponse(
                null,
                "Bearer",
                participante.getEmail(),
                participante.getNombre(),
                participante.getRol().name());
    }
}