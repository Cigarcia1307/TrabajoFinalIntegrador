# Trabajo Final Integrador

**Trabajo Final UTN**
**ColectaApp — Plataforma de Colectas Indexadas y Circulares**

> **Trabajo Integrador Final (TIF)**
> **Carrera:** Tecnicatura Universitaria en Programación a distancia — UTN
> **Integrantes:** Pablo De La Puente, Eugenia Demarchi y Cintia García
> **Tutora:** Sofía Carnevale
> **Estado:** En desarrollo — 1.ª Entrega (Propuesta de Proyecto y Repositorio)

---

## 📌 Descripción del Proyecto

En contextos económicos de alta inflación, la gestión manual de colectas periódicas (cumpleaños escolares, eventos en oficinas, comisiones de empleados) presenta serios inconvenientes: pérdida del poder adquisitivo, falta de transparencia, cálculos erróneos y desgaste del rol del tesorero.

**ColectaApp** es una plataforma web que automatiza la gestión de cadenas de cobro circulares mediante el uso de **índices de referencia dinámicos** (Litros de Nafta YPF, Cajita Feliz, Dólar MEP, etc.). La aplicación elimina el trabajo manual en planillas de Excel y garantiza que todos los participantes aporten y reciban un valor equitativo a lo largo del ciclo.

El caso de uso con el que se prototipa y valida este TIF es un **grupo de padres de un colegio**, gestionando las colectas de cumpleaños de los alumnos a lo largo de un ciclo lectivo.

---

## ✨ Características Principales

* **Cadena de Obligaciones Circular:** algoritmo dinámico que gestiona el orden de recaudación (ej.: el cumpleañero de marzo inicia la cadena para el de abril, y así sucesivamente).
* **Protección Anti-Inflación (Índices Configurables):** los montos se fijan en **Unidades de Referencia** configurables por el grupo (ej.: 5 litros de nafta súper por participante).
* **Congelamiento de Valor Automático:** el sistema ejecuta un proceso programado que fija el valor exacto en `$ ARS` el **día hábil anterior** a la colecta.
* **Trazabilidad e Historial:** implementación de **baja lógica** para participantes que se retiren durante el ciclo, protegiendo la integridad del historial contable.
* **Notificaciones y Recordatorios:** envío automático de alertas con CBU/Alias y monto exacto a transferir.
* **Diseño Extensible:** el dominio de negocio no depende de vocabulario específico del ámbito escolar (se modela como *participantes* y *beneficiarios*, no como "padres" e "hijos" a nivel de código), por lo que adaptar la plataforma a otros ámbitos (ej.: departamentos corporativos) sería una ampliación incremental sobre el modelo actual. **El prototipo de este TIF se implementa y valida exclusivamente para el caso de uso escolar** — el soporte multi-organización queda fuera de alcance.

---

## 🛠️ Arquitectura y Aspectos Técnicos

El desarrollo aborda los siguientes desafíos de ingeniería de software:

* **Patrón Strategy:** módulo extensible para la consulta e integración de distintos proveedores de cotización (Scrapers y APIs externas — Nafta, Dólar MEP, etc.), de forma que el motor de colectas no dependa de qué índice esté activo.
* **Engine Contable (Ledger):** registro de saldos y transacciones basado en unidades abstractas de cuenta, con conversión a pesos en tiempo de ejecución según el historial.
* **Scheduler / Cron Jobs:** tareas en segundo plano para el congelamiento de tarifas en días hábiles y ejecución de alertas.
* **Seguridad y Control de Acceso:** autenticación mediante JWT, cifrado de datos sensibles y control de acceso basado en roles (RBAC) — Administrador/Tesorero y Participante.

---

## 🏗️ Stack Tecnológico Proyectado

| Componente | Tecnología / Proveedor | Descripción |
|---|---|---|
| **Frontend** | React + TypeScript | Permite desarrollar rápidamente una interfaz web modular y tiene abundante documentación y recursos disponibles. |
| **Backend** | Java + Spring Boot | Permite mantener Java y aplicar POO. Spring Data MongoDB facilita la integración del backend con MongoDB. |
| **Gestor de dependencias** | Gradle | Permite gestionar las dependencias y automatizar la construcción del proyecto de forma sencilla. |
| **API** | REST | Enfoque simple y ampliamente utilizado para comunicar frontend y backend mediante HTTP y JSON. |
| **Base de datos** | MongoDB Atlas | Permite utilizar MongoDB en la nube sin tener que administrar un servidor de base de datos propio. |
| **Despliegue Frontend** | Netlify | Facilita el despliegue del frontend directamente desde GitHub, con integración continua por rama. |
| **Despliegue Backend** | Render | Permite desplegar el backend sin administrar un servidor propio. Se evaluará el uso de Docker solo si fuera necesario. |
| **Control de versiones** | Git + GitHub | Permite trabajar colaborativamente y cumplir con el requisito de un único repositorio para todo el proyecto. |

---

## ☁️ Despliegue

| Componente | URL |
|---|---|
| Frontend (Netlify) | _pendiente de despliegue_ |
| Backend (Render) | _pendiente de despliegue_ |
| Base de datos (MongoDB Atlas) | Cluster M0 — configurado |

---

## 📂 Estructura del Repositorio

```text
├── frontend/              # React + TypeScript
│   └── src/
├── backend/                # Java + Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── ...
│   │   │   │       ├── modules/     # Participante, Colecta, etc.
│   │   │   │       ├── strategy/    # Estrategias de cotización (Nafta, Dólar MEP...)
│   │   │   │       ├── jobs/        # Cron jobs (congelamiento, notificaciones)
│   │   │   │       ├── security/    # JWT, roles
│   │   │   │       └── config/
│   │   │   └── resources/
│   │   └── test/                    # Pruebas unitarias e integradoras
│   └── build.gradle
├── docs/                   # Documentación técnica, diagramas y entregas parciales
│   ├── propuesta/
│   └── diseño/
├── .gitignore
├── LICENSE
└── README.md
```

---

## 👥 Integrantes

| Nombre | Rol |
|---|---|
| Pablo De La Puente | — |
| Eugenia Demarchi | — |
| Cintia García | — |

---


