package com.colectaapp.backend.indices.cotizaciones;

import com.colectaapp.backend.indices.Indice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Nafta súper YPF: fuente AUTOMÁTICA, datos abiertos oficiales.
 *
 * La Resolución 314/2016 obliga a las estaciones de servicio a informar sus precios;
 * la Secretaría de Energía los publica como CSV ("Precios en surtidor", datos.energia.gob.ar).
 * Esta strategy descarga ese CSV, filtra YPF + nafta súper + horario diurno + la provincia
 * configurada, y toma la MEDIANA de los precios (así una estación con un precio raro no
 * mueve el resultado). Guarda el resultado en memoria unas horas para no descargar el
 * archivo en cada consulta.
 *
 * Si la URL no está configurada o la descarga falla, usa el último precio cargado
 * por un administrador.
 */
@Component
public class NaftaYpfStrategy implements CotizacionStrategy {

    private static final Logger log = LoggerFactory.getLogger(NaftaYpfStrategy.class);
    private static final Duration CACHE = Duration.ofHours(6);

    private final CotizacionCargadaService cargadas;
    private final String url;
    private final String provincia;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private Cotizacion enCache;
    private Instant vencimientoCache = Instant.EPOCH;

    public NaftaYpfStrategy(
            CotizacionCargadaService cargadas,
            @Value("${app.cotizaciones.nafta-csv-url:}") String url,
            @Value("${app.cotizaciones.nafta-provincia:CAPITAL FEDERAL}") String provincia) {
        this.cargadas = cargadas;
        this.url = url;
        this.provincia = provincia;
    }

    @Override
    public Indice getIndice() {
        return Indice.NAFTA_YPF;
    }

    @Override
    public synchronized Cotizacion obtenerCotizacionActual() {
        if (enCache != null && Instant.now().isBefore(vencimientoCache)) {
            return enCache;
        }
        if (url == null || url.isBlank()) {
            log.info("app.cotizaciones.nafta-csv-url no está configurada: se usa el precio cargado a mano");
            return cargadas.ultimaObligatoria(getIndice());
        }
        try {
            Cotizacion cotizacion = descargarYCalcular();
            enCache = cotizacion;
            vencimientoCache = Instant.now().plus(CACHE);
            return cotizacion;
        } catch (Exception e) {
            log.warn("No se pudo obtener la nafta desde datos abiertos: {}", e.getMessage());
            return cargadas.ultimaObligatoria(getIndice());
        }
    }

    private Cotizacion descargarYCalcular() throws Exception {
        HttpRequest pedido = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofMinutes(2))
                .GET()
                .build();
        HttpResponse<InputStream> respuesta = httpClient.send(pedido, HttpResponse.BodyHandlers.ofInputStream());
        if (respuesta.statusCode() != 200) {
            throw new IllegalStateException("El CSV respondió HTTP " + respuesta.statusCode());
        }

        try (BufferedReader lector = new BufferedReader(
                new InputStreamReader(respuesta.body(), StandardCharsets.UTF_8))) {

            String encabezado = lector.readLine();
            if (encabezado == null) {
                throw new IllegalStateException("El CSV está vacío");
            }
            List<String> columnas = separar(sinBom(encabezado)).stream()
                    .map(c -> normalizar(c))
                    .toList();
            int colBandera = columna(columnas, "empresabandera");
            int colProducto = columna(columnas, "producto");
            int colPrecio = columna(columnas, "precio");
            int colFecha = columna(columnas, "fecha_vigencia");
            int colProvincia = columna(columnas, "provincia");
            int colHorario = columnas.indexOf("tipohorario"); // opcional

            String provinciaBuscada = normalizar(provincia);
            List<Double> precios = new ArrayList<>();
            LocalDate fechaMasReciente = null;

            String linea;
            while ((linea = lector.readLine()) != null) {
                List<String> campos = separar(linea);
                if (campos.size() < columnas.size()) {
                    continue;
                }
                String producto = normalizar(campos.get(colProducto));
                boolean coincide = normalizar(campos.get(colBandera)).contains("ypf")
                        && producto.contains("nafta") && producto.contains("super")
                        && normalizar(campos.get(colProvincia)).equals(provinciaBuscada)
                        && (colHorario < 0 || normalizar(campos.get(colHorario)).startsWith("diurno"));
                if (!coincide) {
                    continue;
                }
                Double precio = numero(campos.get(colPrecio));
                if (precio == null || precio <= 0) {
                    continue;
                }
                precios.add(precio);
                LocalDate fecha = fecha(campos.get(colFecha));
                if (fecha != null && (fechaMasReciente == null || fecha.isAfter(fechaMasReciente))) {
                    fechaMasReciente = fecha;
                }
            }

            if (precios.isEmpty()) {
                throw new IllegalStateException("No hay precios de YPF nafta súper para " + provincia);
            }
            return new Cotizacion(getIndice().getId(),
                    fechaMasReciente != null ? fechaMasReciente : LocalDate.now(),
                    mediana(precios), Cotizacion.AUTOMATICA);
        }
    }

    // ── Ayudas para leer el CSV ─────────────────────────────────────────────

    private static int columna(List<String> columnas, String nombre) {
        int i = columnas.indexOf(nombre);
        if (i < 0) {
            throw new IllegalStateException("El CSV no tiene la columna " + nombre + " (columnas: " + columnas + ")");
        }
        return i;
    }

    /** Separa una línea CSV respetando los campos entre comillas (que pueden tener comas adentro). */
    static List<String> separar(String linea) {
        List<String> campos = new ArrayList<>();
        StringBuilder actual = new StringBuilder();
        boolean entreComillas = false;
        for (int i = 0; i < linea.length(); i++) {
            char c = linea.charAt(i);
            if (c == '"') {
                if (entreComillas && i + 1 < linea.length() && linea.charAt(i + 1) == '"') {
                    actual.append('"'); // comilla escapada ("")
                    i++;
                } else {
                    entreComillas = !entreComillas;
                }
            } else if (c == ',' && !entreComillas) {
                campos.add(actual.toString());
                actual.setLength(0);
            } else {
                actual.append(c);
            }
        }
        campos.add(actual.toString());
        return campos;
    }

    /** Minúsculas, sin tildes y sin espacios sobrantes: "Nafta (súper)" → "nafta (super)". */
    static String normalizar(String texto) {
        String sinTildes = Normalizer.normalize(texto.trim(), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return sinTildes.toLowerCase(Locale.ROOT);
    }

    private static String sinBom(String texto) {
        return texto.startsWith("﻿") ? texto.substring(1) : texto;
    }

    private static Double numero(String texto) {
        try {
            return Double.parseDouble(texto.trim().replace(",", "."));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** "2026-11-14 08:00:00" o "2026-11-14" → 2026-11-14. */
    private static LocalDate fecha(String texto) {
        String t = texto.trim();
        if (t.length() < 10) {
            return null;
        }
        try {
            return LocalDate.parse(t.substring(0, 10));
        } catch (Exception e) {
            return null;
        }
    }

    static double mediana(List<Double> valores) {
        List<Double> ordenados = valores.stream().sorted().toList();
        int medio = ordenados.size() / 2;
        double resultado = ordenados.size() % 2 == 1
                ? ordenados.get(medio)
                : (ordenados.get(medio - 1) + ordenados.get(medio)) / 2;
        return Math.round(resultado * 100) / 100.0;
    }
}
