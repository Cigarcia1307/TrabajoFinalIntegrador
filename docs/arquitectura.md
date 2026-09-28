# Arquitectura del Proyecto – ColectaApp

## Arquitectura elegida

ColectaApp utilizará una arquitectura en capas, separando las responsabilidades
del sistema para facilitar su desarrollo, mantenimiento y evolución.

La aplicación estará dividida principalmente en:

- **Frontend:** interfaz utilizada por los usuarios.
- **Backend:** contiene la lógica de negocio y expone los servicios mediante una API REST.
- **Base de datos:** almacena la información necesaria para el funcionamiento del sistema.

La comunicación entre el frontend y el backend se realizará mediante peticiones HTTP
a una API REST, utilizando JSON para el intercambio de datos.

## Organización del Backend

El backend desarrollado con Java y Spring Boot seguirá una separación por capas:

- **Controller:** recibe las solicitudes HTTP y expone los endpoints de la API REST.
- **Service:** contiene la lógica de negocio de la aplicación.
- **Repository:** gestiona el acceso y las operaciones sobre la base de datos.
- **Model/Entity:** representa las entidades y estructuras de datos del sistema.

Esta separación permite que cada parte tenga una responsabilidad específica,
facilitando las pruebas, el mantenimiento y futuras modificaciones.

## Tecnologías utilizadas

| Componente | Tecnología |
|---|---|
| Frontend | React + TypeScript |
| Backend | Java + Spring Boot |
| Gestor de dependencias | Gradle |
| API | REST |
| Base de datos | MongoDB Atlas |
| Despliegue Frontend | Netlify |
| Despliegue Backend | Render |
| Control de versiones | Git + GitHub |

## Justificación de las decisiones técnicas

### React + TypeScript
Se eligió React para desarrollar una interfaz web basada en componentes reutilizables.
TypeScript permite agregar tipado al código JavaScript y facilita la detección de errores
durante el desarrollo.

### Java + Spring Boot
Java permite aplicar los conceptos de programación orientada a objetos trabajados durante
la carrera. Spring Boot facilita la creación del backend y de servicios REST, además de
permitir la integración con MongoDB mediante Spring Data MongoDB.

### MongoDB Atlas
Se utiliza MongoDB como base de datos NoSQL y MongoDB Atlas permite alojarla en la nube
sin necesidad de administrar un servidor de base de datos propio.

### API REST
Se utiliza REST para permitir la comunicación entre frontend y backend mediante HTTP.
Los datos serán intercambiados principalmente en formato JSON.

### Gradle
Se utiliza para gestionar las dependencias del backend y automatizar la construcción
del proyecto.

### Git y GitHub
Se utilizan para el control de versiones y el trabajo colaborativo del equipo.
Todo el proyecto se mantiene dentro de un único repositorio.

### Netlify y Render
Netlify será utilizado para el despliegue del frontend y Render para el backend,
permitiendo publicar ambos componentes sin administrar servidores propios.

## Estructura general

La arquitectura puede representarse de forma simplificada de la siguiente manera:

Usuario
↓
Frontend (React + TypeScript)
↓
API REST / HTTP / JSON
↓
Backend (Java + Spring Boot)
↓
Controller
↓
Service
↓
Repository
↓
MongoDB Atlas