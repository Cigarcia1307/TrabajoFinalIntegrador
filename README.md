# Trabajo Final Integrador
Trabajo Final UTN
ColectaApp - Plataforma de Colectas Indexadas y Circulares

> **Trabajo Integrador Final (TIF)**  
> **Carrera:** Tecnicatura Universitaria en Programación
> **Integrantes:** Pablo de la Puente, Eugenia Demarchi y Cintia García.
> **Comisión:** 
> **Estado:** En desarrollo  

---

## 📌 Descripción del Proyecto

En contextos económicos de alta inflación, la gestión manual de colectas periódicas (cumpleaños escolares, eventos en oficinas, comisiones de empleados) presenta serios inconvenientes: pérdida del poder adquisitivo, falta de transparencia, cálculos erróneos y desgaste del rol del tesorero.

**ColectaApp** es una plataforma web/móvil multi-entidad que automatiza la gestión de cadenas de cobro circulares mediante el uso de **índices de referencia dinámicos** (Litros de Nafta YPF, Cajita Feliz, Dólar MEP, etc.). La aplicación elimina el trabajo manual en planillas de Excel y garantiza que todos los participantes aporten y reciban un valor equitativo a lo largo del ciclo.

---

## ✨ Características Principales

* **cadena de Obligaciones Circular:** Algoritmo dinámico que gestiona el orden de recaudación (ej: el cumpleañero de marzo inicia la cadena para el de abril, y así sucesivamente).
* **Protección Anti-Inflación (Índices Configurables):** Los montos se fijan en **Unidades de Referencia** configurables por el grupo (ej: 5 litros de nafta súper por participante).
* **Congelamiento de Valor Automático:** El sistema ejecuta un proceso programado que fija el valor exacto en `$ ARS` el **día hábil anterior** a la colecta.
* **Trazabilidad e Historial:** Implementación de **baja lógica** para participantes que se retiren durante el ciclo, protegiendo la integridad del historial contable.
* **Notificaciones y Recordatorios:** Envío automático de alertas con CBU/Alias y monto exacto a transferir.
* **Multitenancy / Escalabilidad:** Adaptable tanto para grupos escolares como para departamentos corporativos (ej: empleados de un banco).

---

## 🛠️ Arquitectura y Aspectos Técnicos

El desarrollo aborda los siguientes desafíos de ingeniería de software: ESTE PUNTO HAY Q VER BIEN!!!

* **Patrón Strategy:** Módulo extensible para la consulta e integración de distintos proveedores de cotización (Scrapers y APIs externas).
* **Engine Contable (Ledger):** Registro de saldos y transacciones basado en unidades abstractas de cuenta con conversión en tiempo de ejecución.
* **Scheduler / Cron Jobs:** Tareas en segundo plano para el congelamiento de tarifas en días hábiles y ejecución de alertas.
* **Seguridad y Control de Acceso:** Autenticación mediante JWT, cifrado de datos sensibles y control de acceso basado en roles (RBAC).

---

## 🏗️ Stack Tecnológico Proyectado

* **Frontend:** React + TypeScript
Permite desarrollar rápidamente una interfaz web modular y tiene abundante documentación y recursos disponibles.


* **Backend:** Java + Spring Boot
Permite mantener Java y aplicar POO. Spring Data MongoDB facilita la integración del backend con MongoDB.


* **Base de Datos:** MongoDB Atlas
Permite utilizar MongoDB en la nube sin tener que administrar un servidor de base de datos propio.


* **Gestor de dependencias:** Gradle
Permite gestionar las dependencias y automatizar la construcción del proyecto de forma sencilla.

* **Api** REST
Es un enfoque simple y ampliamente utilizado para comunicar frontend y backend mediante HTTP y JSON.

* **Control de versiones:** Git + GitHub
Permite trabajar colaborativamente y cumplir con el requisito de utilizar un único repositorio para todo el proyecto.





---

## 📂 Estructura del Repositorio (Propuesta)

```text
├── docs/                 # Documentación técnica, diagramas E-R y arquitectura
├── src/
│   ├── modules/          # Módulos principales (Users, Groups)
│   ├──
│   ├── jobs/             # Tareas programadas (Cron jobs)
│   └── config/           # Configuraciones generales
├── tests/                # Pruebas unitarias e integradoras
├── .gitignore
├── LICENSE
└── README.md
