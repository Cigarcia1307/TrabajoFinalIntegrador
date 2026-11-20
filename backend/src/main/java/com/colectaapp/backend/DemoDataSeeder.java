package com.colectaapp.backend;

import com.colectaapp.backend.aportes.Aporte;
import com.colectaapp.backend.auth.Rol;
import com.colectaapp.backend.colectas.CicloLectivo;
import com.colectaapp.backend.colectas.CicloLectivoRepository;
import com.colectaapp.backend.colectas.Colecta;
import com.colectaapp.backend.colectas.ColectaRepository;
import com.colectaapp.backend.colectas.ColectaService;
import com.colectaapp.backend.congelamiento.PrecioReferencia;
import com.colectaapp.backend.congelamiento.PrecioReferenciaRepository;
import com.colectaapp.backend.indices.cotizaciones.CotizacionCargada;
import com.colectaapp.backend.indices.cotizaciones.CotizacionCargadaRepository;
import com.colectaapp.backend.indices.votacion.VotacionIndice;
import com.colectaapp.backend.indices.votacion.VotacionIndiceRepository;
import com.colectaapp.backend.participantes.Beneficiario;
import com.colectaapp.backend.participantes.Participante;
import com.colectaapp.backend.participantes.ParticipanteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final int CICLO = 2026;

    private final ParticipanteRepository participanteRepository;
    private final CicloLectivoRepository cicloRepository;
    private final ColectaRepository colectaRepository;
    private final ColectaService colectaService;
    private final VotacionIndiceRepository votacionRepository;
    private final CotizacionCargadaRepository cotizacionCargadaRepository;
    private final PrecioReferenciaRepository precioReferenciaRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            ParticipanteRepository participanteRepository,
            CicloLectivoRepository cicloRepository,
            ColectaRepository colectaRepository,
            ColectaService colectaService,
            VotacionIndiceRepository votacionRepository,
            CotizacionCargadaRepository cotizacionCargadaRepository,
            PrecioReferenciaRepository precioReferenciaRepository,
            PasswordEncoder passwordEncoder) {
        this.participanteRepository = participanteRepository;
        this.cicloRepository = cicloRepository;
        this.colectaRepository = colectaRepository;
        this.colectaService = colectaService;
        this.votacionRepository = votacionRepository;
        this.cotizacionCargadaRepository = cotizacionCargadaRepository;
        this.precioReferenciaRepository = precioReferenciaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Map<String, Participante> participantes = crearParticipantes();
        crearCicloYColectas(participantes);
        crearVotacion(participantes.get("juan").getId());
        crearPrecios(participantes.get("juan").getEmail());
    }

    private Map<String, Participante> crearParticipantes() {
        Participante juan = guardarParticipante("6a9dec18b9068acfd506196b",
                "Juan", "Pérez", "juan.perez@gmail.com", "3511234567",
                "juan.perez.mp", Rol.ADMINISTRADOR,
                new Beneficiario("Tomás", LocalDate.of(2015, 3, 20)));

        Participante maria = guardarParticipante("6a9dfd0ab9068acfd5061971",
                "María", "Gómez", "maria.gomez@gmail.com", "3512345678",
                "maria.gomez.mp", Rol.PARTICIPANTE,
                new Beneficiario("Sofía", LocalDate.of(2015, 6, 30)));

        Participante carlos = guardarParticipante("6a9dfd4ab9068acfd5061973",
                "Carlos", "Fernández", "carlos.fernandez@gmail.com", "3513456789",
                "carlos.fernandez.mp", Rol.PARTICIPANTE,
                new Beneficiario("Valentina", LocalDate.of(2015, 9, 15)));

        Participante laura = guardarParticipante("6a9e10aab9068acfd5061975",
                "Laura", "Paz", "laura.paz@gmail.com", "3514567890",
                "laura.paz.mp", Rol.PARTICIPANTE,
                new Beneficiario("Martina", LocalDate.of(2015, 10, 9)));

        Participante diego = guardarParticipante("6a9e10bbb9068acfd5061977",
                "Diego", "Ríos", "diego.rios@gmail.com", "3515678901",
                "diego.rios.mp", Rol.PARTICIPANTE,
                new Beneficiario("Benjamín", LocalDate.of(2015, 11, 5)));

        Participante ana = guardarParticipante("6a9e10ccb9068acfd5061979",
                "Ana", "Suárez", "ana.suarez@gmail.com", "3516789012",
                "ana.suarez.mp", Rol.PARTICIPANTE,
                new Beneficiario("Camila", LocalDate.of(2015, 11, 27)));

        return Map.of(
                "juan", juan,
                "maria", maria,
                "carlos", carlos,
                "laura", laura,
                "diego", diego,
                "ana", ana);
    }

    private Participante guardarParticipante(
            String id,
            String nombre,
            String apellido,
            String email,
            String telefono,
            String cbuAlias,
            Rol rol,
            Beneficiario hijo) {

        Participante participante = participanteRepository.findByEmail(email)
                .orElseGet(Participante::new);

        participante.setId(participante.getId() == null ? id : participante.getId());
        participante.setNombre(nombre);
        participante.setApellido(apellido);
        participante.setEmail(email);
        participante.setTelefono(telefono);
        participante.setCbuAlias(cbuAlias);
        participante.setRol(rol);
        participante.setActivo(true);
        participante.setHijos(new ArrayList<>(List.of(hijo)));

        String password = rol == Rol.ADMINISTRADOR ? "Admin123!" : "Participante123!";
        participante.setPassword(passwordEncoder.encode(password));

        return participanteRepository.save(participante);
    }

    private void crearCicloYColectas(Map<String, Participante> participantes) {
        cicloRepository.findByAnio(CICLO)
                .orElseGet(() -> cicloRepository.save(new CicloLectivo(null, CICLO, true)));

        if (!colectaRepository.existsByCicloLectivo(CICLO)) {
            colectaService.generarColectas(CICLO, participantes.get("maria").getId());
        }

        configurarColectas(participantes);
    }

    private void configurarColectas(Map<String, Participante> participantes) {
        List<String> ids = participantes.values().stream()
                .map(Participante::getId)
                .toList();

        for (Colecta colecta : colectaRepository.findByCicloLectivo(CICLO)) {
            String padreBeneficiario = colecta.getPadreId();
            List<Aporte> aportes = new ArrayList<>();

            for (String padreId : ids) {
                if (!padreId.equals(padreBeneficiario)) {
                    aportes.add(Aporte.nuevo(padreId));
                }
            }

            if ("Tomás".equals(colecta.getBeneficiarioNombre())) {
                completarColecta(colecta, "cerrada", 5600, 28000, 1, 5600,
                        aportes, LocalDate.of(2026, 3, 18));
            } else if ("Sofía".equals(colecta.getBeneficiarioNombre())) {
                for (Aporte aporte : aportes) {
                    if (aporte.getPadreId().equals(participantes.get("ana").getId())) {
                        aporte.setParticipa(false);
                    } else {
                    aporte.setParticipa(true);
                    aporte.setPagado(true);
                    aporte.setMontoPagado(6250);
                    aporte.setFechaPago("2026-06-28");
                    }
                }
                completarColecta(colecta, "cerrada", 6250, 31250, 1, 6250,
                        aportes, LocalDate.of(2026, 6, 28));
            } else if ("Valentina".equals(colecta.getBeneficiarioNombre())) {
                completarColecta(colecta, "cerrada", 7100, 35500, 1, 7100,
                        aportes, LocalDate.of(2026, 9, 12));
            } else if ("Martina".equals(colecta.getBeneficiarioNombre())) {
                for (Aporte aporte : aportes) {
                    if (aporte.getPadreId().equals(participantes.get("juan").getId())
                            || aporte.getPadreId().equals(participantes.get("carlos").getId())) {
                        aporte.setParticipa(true);
                        aporte.setPagado(true);
                        aporte.setMontoPagado(7450);
                        aporte.setFechaPago("2026-10-08");
                    } else if (aporte.getPadreId().equals(participantes.get("maria").getId())) {
                        aporte.setParticipa(true);
                    } else if (aporte.getPadreId().equals(participantes.get("diego").getId())) {
                        aporte.setParticipa(false);
                    }
                }
                completarColecta(colecta, "en_recaudacion", 7450, 37250, 5, 7450,
                        aportes, null);
            } else if ("Benjamín".equals(colecta.getBeneficiarioNombre())) {
                completarColecta(colecta, "en_recaudacion", 0, 0, null, 0,
                        aportes, null);
            } else if ("Camila".equals(colecta.getBeneficiarioNombre())) {
                completarColecta(colecta, "en_recaudacion", 0, 0, null, 0,
                        aportes, null);
            }

            colectaRepository.save(colecta);
        }
    }

    private void completarColecta(
            Colecta colecta,
            String estado,
            double montoIndividual,
            double montoTotal,
            Integer cantidadUnidades,
            double montoPagado,
            List<Aporte> aportes,
            LocalDate fechaPagos) {

        colecta.setEstadoColecta(estado);
        colecta.setMontoIndividualPesos(montoIndividual);
        colecta.setMontoTotalObjetivo(montoTotal);
        colecta.setIndiceReferencia("nafta_ypf");
        colecta.setCantidadUnidades(cantidadUnidades == null ? null : cantidadUnidades.doubleValue());

        if ("cerrada".equals(estado)) {
            for (Aporte aporte : aportes) {
                if (aporte.getParticipa() == null) {
                    aporte.setParticipa(true);
                }
                if (Boolean.TRUE.equals(aporte.getParticipa())) {
                    aporte.setPagado(true);
                    aporte.setMontoPagado(montoPagado);
                    aporte.setFechaPago(fechaPagos == null ? null : fechaPagos.toString());
                }
            }
        }

        colecta.setAportes(aportes);
    }

    private void crearVotacion(String adminId) {
        if (votacionRepository.findByCicloLectivo(CICLO).isPresent()) {
            return;
        }

        VotacionIndice votacion = new VotacionIndice();
        votacion.setCicloLectivo(CICLO);
        votacion.setEstado(VotacionIndice.CERRADA);
        votacion.setCreadaPor(adminId);
        votacion.setFechaApertura(LocalDate.of(2026, 3, 2));
        votacion.setFechaCierre(LocalDate.of(2026, 3, 9));
        votacion.setOpciones(List.of(
                new VotacionIndice.Opcion("nafta_ypf", 5),
                new VotacionIndice.Opcion("dolar_mep", 5),
                new VotacionIndice.Opcion("cajita_feliz", 1)));
        votacion.setVotos(List.of(
                new VotacionIndice.Voto("6a9dec18b9068acfd506196b", "nafta_ypf", LocalDate.of(2026, 3, 3)),
                new VotacionIndice.Voto("6a9dfd0ab9068acfd5061971", "nafta_ypf", LocalDate.of(2026, 3, 4)),
                new VotacionIndice.Voto("6a9dfd4ab9068acfd5061973", "dolar_mep", LocalDate.of(2026, 3, 5))));
        votacion.setIndiceElegido("nafta_ypf");
        votacion.setCantidadUnidades(5.0);
        votacionRepository.save(votacion);
    }

    private void crearPrecios(String adminEmail) {
        cotizacionCargadaRepository.findFirstByIndiceOrderByFechaDesc("cajita_feliz")
                .orElseGet(() -> cotizacionCargadaRepository.save(
                        new CotizacionCargada(null, "cajita_feliz",
                                LocalDate.of(2026, 11, 15), 15200, adminEmail)));

        cotizacionCargadaRepository.findFirstByIndiceOrderByFechaDesc("nafta_ypf")
                .orElseGet(() -> cotizacionCargadaRepository.save(
                        new CotizacionCargada(null, "nafta_ypf",
                                LocalDate.of(2026, 10, 8), 1490, adminEmail)));

        if (precioReferenciaRepository.findAllByOrderByFechaDesc().isEmpty()) {
            precioReferenciaRepository.save(new PrecioReferencia(
                    null, "colecta-1-tomas", "nafta_ypf",
                    LocalDate.of(2026, 3, 19), 1120));
            precioReferenciaRepository.save(new PrecioReferencia(
                    null, "colecta-2-sofia", "nafta_ypf",
                    LocalDate.of(2026, 6, 29), 1250));
            precioReferenciaRepository.save(new PrecioReferencia(
                    null, "colecta-3-valentina", "nafta_ypf",
                    LocalDate.of(2026, 9, 14), 1420));
            precioReferenciaRepository.save(new PrecioReferencia(
                    null, null, "nafta_ypf",
                    LocalDate.of(2026, 10, 8), 1490));
        }
    }
}
