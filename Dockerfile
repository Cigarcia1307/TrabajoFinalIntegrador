
# Etapa 1: construir el backend
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copiar el backend
COPY backend/ ./backend/

# Dar permisos de ejecución al Gradle Wrapper
RUN chmod +x backend/gradlew

# Compilar y generar el JAR
WORKDIR /app/backend
RUN ./gradlew bootJar --no-daemon

# Etapa 2: ejecutar el backend
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copiar el JAR generado
COPY --from=build /app/backend/build/libs/*.jar app.jar

# Puerto de la aplicación
EXPOSE 8080

# Ejecutar Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
