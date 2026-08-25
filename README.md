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

En contextos económicos de alta inflación, la gestión manual de colectas periódicas para cumpleaños escolares presenta inconvenientes como pérdida del poder adquisitivo, falta de transparencia, cálculos erróneos y desgaste del rol del recaudador.

**ColectaApp** es una plataforma web destinada a facilitar la gestión de colectas de cumpleaños dentro de un grupo escolar. La aplicación permite administrar un circuito permanente de participantes, generar automáticamente las colectas correspondientes a cada cumpleaños y determinar el importe a aportar mediante unidades de referencia configurables.

El sistema busca reducir el trabajo manual realizado actualmente mediante planillas de cálculo, facilitando el registro de participantes, la determinación del importe correspondiente a cada colecta y el seguimiento de los aportes realizados.

El caso de uso inicial del proyecto es un grupo de padres de un colegio, donde se gestionan las colectas de cumpleaños de los alumnos durante el ciclo lectivo.

**Alcance:** ColectaApp no procesa pagos ni realiza transferencias. Los aportes se realizan por fuera de la plataforma y el recaudador registra en el sistema los aportes recibidos.

---

## 🎯 Objetivos del Proyecto

**Objetivo general:** desarrollar una plataforma web que automatice la gestión de colectas de cumpleaños circulares entre grupos de padres de un colegio, protegiendo el valor económico del aporte frente a la inflación mediante unidades de referencia configurables.

**Objetivos específicos:**

* Diseñar un modelo de participantes que permita la participación opcional e independiente en cada colecta.
* Automatizar la generación de colectas a partir de un calendario de cumpleaños cargado por el administrador.
* Implementar un mecanismo de indexación que fije el importe a aportar en unidades de referencia (no en pesos), congelando su valor en ARS el día hábil anterior a cada colecta.
* Incorporar control de acceso basado en roles (Administrador, Recaudador, Participante) mediante autenticación segura.
* Garantizar trazabilidad histórica de participantes y aportes, aun cuando un participante deje de pertenecer al grupo.

---

## ✨ Características Principales

* **Gestión de participantes:** los padres pertenecen al grupo de forma permanente mientras continúen formando parte del mismo. Pueden participar o no participar individualmente en cada colecta.
* **Invitación y registro de usuarios:** el administrador incorpora a los padres al grupo mediante una invitación. El participante completa sus datos y establece su contraseña para crear su cuenta.
* **Gestión de cumpleaños:** el administrador carga manualmente el calendario de cumpleaños de los alumnos.
* **Generación automática de colectas:** a partir del calendario de cumpleaños, el sistema genera automáticamente una colecta para cada cumpleaños, evitando que el administrador tenga que crear cada colecta manualmente.
* **Aportes indexados mediante unidades de referencia:** el grupo puede establecer una unidad de referencia para determinar el importe a aportar (ej.: 5 litros de nafta súper por participante).
* **Congelamiento de Valor Automático:** el sistema ejecuta un proceso programado que fija el valor exacto en pesos argentinos (ARS) el día hábil anterior a la colecta.
* **Participación individual:** para cada colecta, cada participante decide si desea participar o no. La decisión es independiente de las demás colectas.
* **Gestión de recaudadores:** los participantes del grupo pueden ser habilitados como recaudadores. Estos podrán consultar los participantes, visualizar aportes pendientes y registrar los aportes recibidos.
* **Notificaciones y recordatorios:** generación de avisos para informar a los participantes sobre próximas colectas, importe a aportar y los datos proporcionados por el recaudador para realizar el aporte.
* **Trazabilidad e historial:** se conserva el historial de participación y aportes. Los participantes que dejen de pertenecer al grupo serán desactivados, sin eliminar su información histórica.

---

## 🛠️ Arquitectura y Aspectos Técnicos

El desarrollo aborda los siguientes desafíos de ingeniería de software:

* **Patrón Strategy:** se evaluará su utilización para permitir integrar diferentes fuentes de valores de referencia sin modificar la lógica principal del sistema.
* **Tareas programadas (Scheduler):** ejecución automática de procesos como la actualización y congelamiento de valores de referencia y la generación de recordatorios.
* **Seguridad y Control de Acceso:** autenticación mediante JWT, almacenamiento seguro de contraseñas y control de acceso basado en roles (RBAC).

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
colectaapp/
│
├── frontend/              # React + TypeScript
│   ├── src/
│   └── public/
│
├── backend/               # Java + Spring Boot
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   └── build.gradle
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🗓️ Plan de Trabajo

| Entrega | Fecha | Alcance |
|---|---|---|
| **1.ª Entrega** | 30/08 | Propuesta del proyecto, definición de alcance (caso de uso escolar), stack tecnológico proyectado y repositorio único de GitHub con los tres integrantes como colaboradores. |
| **2.ª Entrega** | 27/09 | Diseño y listado de módulos del backend, modelo de datos definitivo y cierre de las decisiones de diseño abiertas (ver más abajo). |
| **Entrega Final** | 14/11 | Aplicación funcional desplegada (frontend en Netlify, backend en Render), documentación completa y defensa oral. |

### Decisiones abiertas (a cerrar antes de la 2.ª Entrega)

* **Asignación del recaudador por colecta:** el rol de recaudador se habilita como condición general del participante, pero falta definir la regla puntual para cada colecta: si se sugiere automáticamente a partir de quien recibió la colecta anterior (sosteniendo la lógica de cadena circular) o si el administrador lo asigna manualmente entre los participantes habilitados.
* **Alcance de las notificaciones:** confirmar si los recordatorios automáticos (vía mail o notificación) quedan dentro del MVP de la Entrega Final o se documentan como una ampliación futura.

---

## 👥 Integrantes

| Nombre | Usuario de GitHub |
|---|---|
| Pablo De La Puente | https://github.com/JohnTheMano |
| Eugenia Demarchi | https://github.com/EugeniaDemarchi |
| Cintia García | https://github.com/Cigarcia1307 |


---
