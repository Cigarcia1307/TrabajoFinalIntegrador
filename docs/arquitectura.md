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

## Organización del Frontend

El frontend, desarrollado con React + TypeScript sobre Vite, se organiza por módulos
funcionales, en espejo con los módulos del backend:

- **app/:** configuración de rutas (React Router) y layout principal (encabezado y navegación).
- **features/:** una carpeta por módulo (auth, participantes, colectas, indices,
  congelamiento, aportes), cada una con sus pantallas y componentes propios.
- **components/ui/:** componentes base reutilizables del sistema de diseño (botones,
  cards, estados), compartidos por todos los módulos.
- **services/:** cliente de la API REST y datos de prueba (mocks) que respetan el
  contrato de endpoints, para desarrollar el frontend antes de tener el backend.
- **styles/tokens.css:** tokens de diseño (colores, tipografía, radios, sombras).

### Estilado con Tailwind CSS

El estilado se resuelve con **Tailwind CSS v4**: cada componente declara sus estilos
mediante clases utilitarias, sin archivos CSS por componente. Las clases disponibles
se generan a partir de los tokens definidos en `styles/tokens.css`, y la paleta por
defecto de Tailwind está desactivada, de modo que solo pueden usarse los valores del
sistema de diseño. El detalle de uso está en `docs/diseno.md`.

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
| Build del frontend | Vite |
| Estilos | Tailwind CSS v4 |
| Navegación | React Router |
| Íconos | Lucide |
| Calidad de código (frontend) | ESLint |
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

### Vite
Se utiliza como herramienta de construcción del frontend: ofrece un servidor de desarrollo
con recarga instantánea y genera una versión optimizada para el despliegue en Netlify.

### Tailwind CSS
Se eligió Tailwind CSS para que el estilado sea modular: los estilos se escriben junto a cada
componente mediante clases utilitarias, en lugar de hojas de estilo separadas que crecen y se
superponen. Los colores, la tipografía y las formas se definen una sola vez como tokens de
diseño, y Tailwind genera las clases a partir de ellos. Esto mantiene la coherencia visual
aunque cada integrante desarrolle pantallas distintas, y facilita cumplir los criterios de
accesibilidad (contraste) definidos en el sistema de diseño.

### React Router y Lucide
React Router gestiona la navegación entre pantallas. Lucide provee un set único de íconos
con estilo homogéneo.

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
Frontend (React + TypeScript + Tailwind CSS)
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