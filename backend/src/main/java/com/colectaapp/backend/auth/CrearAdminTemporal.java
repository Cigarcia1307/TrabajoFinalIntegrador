package com.colectaapp.backend.auth;

import com.colectaapp.backend.participantes.Participante;
import com.colectaapp.backend.participantes.ParticipanteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("crear-admin")
public class CrearAdminTemporal implements CommandLineRunner {

    private final ParticipanteRepository repository;
    private final PasswordEncoder passwordEncoder;

    public CrearAdminTemporal(
            ParticipanteRepository repository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String email = "admin@colectaapp.com";

        if (repository.findByEmail(email).isPresent()) {
            System.out.println("El administrador ya existe.");
            return;
        }

        Participante admin = new Participante();
        admin.setNombre("Admin");
        admin.setApellido("ColectaApp");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode("Admin123!"));
        admin.setRol(Rol.ADMINISTRADOR);
        admin.setActivo(true);

        repository.save(admin);

        System.out.println("Administrador creado: " + email);
        System.out.println("Contraseña temporal: Admin123!");
    }
}