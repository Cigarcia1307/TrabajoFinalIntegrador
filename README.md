# Trabajo Final Integrador

**Trabajo Final UTN**
**ColectaApp — Plataforma de Colectas Indexadas y Circulares**

> **Trabajo Integrador Final (TIF)**
> **Carrera:** Tecnicatura Universitaria en Programación a distancia — UTN
> **Integrantes:** Pablo De La Puente, Eugenia Demarchi y Cintia García
> **Tutora:** Sofía Carnevale
> **Estado:** En desarrollo — 2.ª Entrega (Diseño y Módulos)

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
* Incorporar control de acceso basado en roles (Administrador, Participante — "Recaudador" es una condición rotativa del Participante, no un rol de acceso) mediante autenticación segura.
* Garantizar trazabilidad histórica de participantes y aportes, aun cuando un participante deje de pertenecer al grupo.

---

## ✨ Características Principales

* **Gestión de participantes:** los padres pertenecen al grupo de forma permanente mientras continúen formando parte del mismo. Pueden participar o no participar individualmente en cada colecta.
* **Invitación y registro de usuarios:** el administrador incorpora a los padres al grupo mediante una invitación. El participante completa sus datos y establece su contraseña para crear su cuenta.
* **Gestión de cumpleaños:** el administrador carga manualmente el calendario de cumpleaños de los alumnos.
* **Generación automática de colectas:** a partir del calendario de cumpleaños, el sistema genera automáticamente una colecta para cada cumpleaños, evitando que el administrador tenga que crear cada colecta manualmente.
* **Aportes indexados mediante unidades de referencia:** el grupo puede establecer una unidad de referencia para determinar el importe a aportar (ej.: 5 litros de nafta súper por participante).
* **Congelamiento de Valor Automático:** el sistema ejecuta un proceso programado que fija el valor exacto en pesos argentinos (ARS) el día hábil anterior a la colecta.
* **Participación individual:** para cada colecta, cada participante decide si desea participar o no. La decisión es independiente de las demás colectas. Esa decisión, y el estado de pago, son visibles únicamente para el propio participante y para el recaudador de esa colecta — el resto del grupo no ve el estado de nadie más (ver "Decisiones de diseño cerradas en la 2.ª Entrega").
* **Gestión de recaudadores:** el recaudador de cada colecta no se asigna manualmente: se resuelve por regla de negocio (ver "Decisiones de diseño cerradas en la 2.ª Entrega"). Es el único, dentro de esa colecta puntual, que puede consultar el estado de todos los participantes (quién participa, quién no, quién ya pagó) y un resumen agregado de lo recaudado frente al objetivo.
* **Recordatorios de pago:** dentro de la aplicación, el participante que todavía no pagó ve un aviso con el monto congelado y el CBU/alias del recaudador, que sube de tono a medida que pasan los días. El recaudador puede copiar un recordatorio listo para pegar en el grupo de WhatsApp (sin nombres) o uno individual para cada pendiente. El envío automático por mail/push queda documentado como ampliación futura (Módulo 7, ver "Módulos del Backend").
* **Trazabilidad e historial:** se conserva el historial de participación y aportes. Los participantes que dejen de pertenecer al grupo serán desactivados, sin eliminar su información histórica.

---

## 🛠️ Arquitectura y Aspectos Técnicos

El desarrollo aborda los siguientes desafíos de ingeniería de software:

* **Patrón Strategy:** resuelve la obtención de cotizaciones de distintos índices de referencia (Nafta YPF, Dólar MEP, Cajita Feliz) mediante una interfaz `CotizacionStrategy` con una implementación por índice, sin acoplar el servicio de colectas a un índice particular.
* **Tareas programadas (Scheduler):** ejecución automática del congelamiento de valores de referencia el día hábil anterior a cada colecta. El envío automático de recordatorios por mail/push queda fuera del MVP (ver "Módulos del Backend").
* **Seguridad y Control de Acceso:** autenticación mediante JWT, almacenamiento seguro de contraseñas y control de acceso basado en roles (RBAC).

---

## 🗂️ Esquema de la Base de Datos

Modelo documental en MongoDB Atlas, diseñado y aprobado en la cátedra de Bases de Datos II, actualizado de forma aditiva para esta entrega: tres colecciones — `padres` (con `hijos` embebidos), `colecta_cumpleanos` (con `aportes` embebidos) y `precio_referencia`. Detalle completo de campos, justificación de embedding/linking y datos de ejemplo en [`database/esquema_base_datos.md`](database/esquema_base_datos.md).

```mermaid
erDiagram
    PADRES {
        ObjectId _id
        string nombre
        string apellido
        string email
        string telefono
        string cbu_alias
        boolean activo
    }
    HIJOS {
        string nombre
        date fecha_nacimiento
    }
    COLECTA_CUMPLEANOS {
        ObjectId _id
        number ciclo_lectivo
        date fecha_cumpleanos
        string beneficiario_nombre
        ObjectId padre_id
        ObjectId recaudador_id
        number monto_individual_pesos
        number monto_total_objetivo
        string estado_colecta
        number orden_en_la_rueda
        boolean es_primera_voluntaria
        string indice_referencia
        number cantidad_unidades "se fija al congelar"
        boolean activo
    }
    APORTES {
        ObjectId padre_id
        boolean participa "true, false o null (sin definir)"
        number monto_pagado
        date fecha_pago
        boolean pagado
    }
    PRECIO_REFERENCIA {
        string indice
        date fecha
        number valor_unitario_ars
    }
    COTIZACION_CARGADA {
        ObjectId _id
        string indice
        date fecha
        number valor_unitario_ars
        string cargada_por
    }
    VOTACION_INDICE {
        ObjectId _id
        number ciclo_lectivo
        string estado "abierta o cerrada"
        ObjectId creada_por
        date fecha_apertura
        date fecha_cierre
        string indice_elegido
        number cantidad_unidades
    }
    OPCIONES {
        string indice
        number cantidad_unidades
    }
    VOTOS {
        ObjectId padre_id
        string indice
        date fecha
    }

    PADRES ||--o{ HIJOS : "embebe (array hijos)"
    PADRES ||--o{ COLECTA_CUMPLEANOS : "beneficiario (padre_id)"
    PADRES ||--o{ COLECTA_CUMPLEANOS : "recaudador (recaudador_id)"
    COLECTA_CUMPLEANOS ||--o{ APORTES : "embebe (array aportes)"
    PADRES ||--o{ APORTES : "aporta (padre_id)"
    VOTACION_INDICE ||--|{ OPCIONES : "embebe (array opciones)"
    VOTACION_INDICE ||--o{ VOTOS : "embebe (array votos)"
    PADRES ||--o{ VOTOS : "vota (padre_id)"
```

> La relación entre `precio_referencia.indice` y `colecta_cumpleanos.indice_referencia` es lógica (por string), no por ObjectId, y no se representa arriba por no ser una referencia formal de la base.

> `votacion_indice` y `colecta_cumpleanos.cantidad_unidades` también son extensiones aditivas: guardan cuántas unidades del índice aporta cada participante (ej. 5 litros de nafta). Se vota una sola vez por ciclo lectivo y el resultado no cambia durante el año. El índice y la cantidad se copian a cada colecta al congelar su monto, para que cada colecta conserve con qué valores se cobró. Detalle en [`database/esquema_base_datos.md`](database/esquema_base_datos.md) (secciones 2.4 y 4).

> El campo `participa` en `aportes[]` es una extensión aditiva sobre el esquema ya aprobado en Bases de Datos II (no modifica ni elimina campos existentes): permite distinguir "decidió no participar" de "todavía no respondió", algo que antes solo se infería de la ausencia de la entrada.

---

## 📦 Módulos del Backend (2.ª Entrega)

En base al esquema definido y a las reglas de negocio de este README, el backend se organiza en seis módulos funcionales para el MVP. Cada uno se detalla con su objetivo, clases principales y endpoints REST — a modo de contrato de API, para poder arrancar el frontend con datos mock que respeten la misma forma que las respuestas reales.

### Módulo 1 · Autenticación y Roles
Gestiona el acceso y diferencia permisos. Roles de sistema: `ADMINISTRADOR` y `PARTICIPANTE` ("Recaudador" no es un rol de acceso, es una condición rotativa determinada por `recaudador_id`). Alta por invitación (link/QR) con registro propio del padre.
**Clases:** `AuthController`, `JwtService`, `SecurityConfig`, `Rol` (enum), `InvitacionService`.
```
POST   /api/auth/invitaciones
POST   /api/auth/registro
POST   /api/auth/login
GET    /api/auth/me
```

### Módulo 2 · Participantes
Administra padres e hijos (beneficiarios) embebidos. Baja lógica vía `activo`.
**Clases:** `Participante`, `Beneficiario`, `ParticipanteController`, `ParticipanteService`, `ParticipanteRepository`.
```
GET    /api/participantes
GET    /api/participantes/{id}
PUT    /api/participantes/{id}
PATCH  /api/participantes/{id}/baja
POST   /api/participantes/{id}/beneficiarios
PUT    /api/participantes/{id}/beneficiarios/{beneficiarioId}
```

### Módulo 3 · Colectas
Crea y da seguimiento a cada colecta dentro de la rueda circular anual, incluyendo la asignación del recaudador (ver decisión cerrada más abajo).
**Clases:** `ColectaCumpleanos`, `CicloLectivo`, `ColectaController`, `ColectaService`, `AsignacionRecaudadorService`.
```
POST   /api/ciclos
GET    /api/colectas?ciclo=2026
GET    /api/colectas/{id}
POST   /api/colectas/{id}/postular-voluntario
GET    /api/colectas/{id}/recaudador
```

> El `recaudador_id` que asigna este módulo es la base del chequeo de autorización del Módulo 6: quién puede ver el estado de todos los aportes de una colecta se resuelve comparando el usuario logueado contra este campo, no con el rol genérico de JWT.

### Módulo 4 · Índices de Referencia (patrón Strategy)
Resuelve la cotización de cada índice sin acoplar el servicio de colectas a uno en particular. El índice **y la cantidad de unidades** por participante (ej. 5 litros de nafta) se fijan por **una única votación** de todos los participantes al inicio del ciclo lectivo y **no se modifican durante el año**, para que todos los cumpleañeros reciban lo mismo en unidades.
**Clases:** `Indice` (enum), `CotizacionStrategy` (interfaz), `NaftaYpfStrategy`, `DolarMepStrategy`, `CajitaFelizStrategy`, `CotizacionService`, `CotizacionCargada`, `VotacionIndice`, `VotacionIndiceService`, `IndiceController` (paquete `backend/.../indices`).

**De dónde sale cada cotización (una Strategy por índice):** lo que se puede obtener solo, se obtiene solo; lo que no tiene fuente pública, lo carga un administrador.

| Índice | Fuente | Strategy |
|---|---|---|
| Dólar MEP | **Automática:** API pública (`app.cotizaciones.dolar-mep-url`, por defecto dolarapi.com, dólar bolsa) | `DolarMepStrategy` |
| Nafta súper YPF | **Automática:** datos abiertos oficiales "Precios vigentes en surtidor" (Resolución 314/2016, Secretaría de Energía). Descarga el CSV (`app.cotizaciones.nafta-csv-url`, ya configurado por defecto), filtra YPF + nafta súper + horario diurno + provincia (`app.cotizaciones.nafta-provincia`), descarta las estaciones que no actualizan su precio (más de 30 días antes del dato más reciente) y toma la mediana. Guarda el resultado 6 horas. El dato es tan reciente como lo publique Energía: la fecha que se muestra es la del precio más nuevo del archivo. | `NaftaYpfStrategy` |
| Cajita Feliz | **Manual:** no hay fuente pública; un administrador carga el precio en la pantalla de Índice | `CajitaFelizStrategy` |

Si una fuente automática falla (o la URL no está configurada), su Strategy usa el último precio cargado por un administrador (colección `cotizacion_cargada`). Agregar o cambiar la fuente de un índice es cambiar solo su Strategy: el resto del sistema (incluido el congelamiento del Módulo 5) usa `CotizacionService` sin saber de dónde sale el valor.
```
GET    /api/indices                            # catálogo de índices (nombre y unidad)
GET    /api/indices/vigente                    # índice y cantidad elegidos para el ciclo actual (404 si todavía no se votó)
GET    /api/indices/votacion                   # votación abierta del ciclo: opciones, resultados y mi voto (204 si no hay)
POST   /api/indices/votacion                   # solo ADMINISTRADOR: abre la votación del ciclo (409 si el ciclo ya tiene una)
POST   /api/indices/votar                      # un voto por participante (409 si ya votó)
POST   /api/indices/votacion/cerrar            # solo ADMINISTRADOR: la más votada queda fija para todo el ciclo
GET    /api/indices/{indice}/cotizacion-actual # valor de hoy de 1 unidad, según su Strategy (503 si no hay ninguno)
POST   /api/indices/{indice}/cotizaciones      # solo ADMINISTRADOR: carga un precio a mano (fuente de la Cajita Feliz y respaldo de los automáticos)
```

> Para el Módulo 5: `VotacionIndiceService.resultadoDelCiclo(ciclo)` devuelve el índice y la cantidad elegidos para un ciclo, y `CotizacionService.obtenerCotizacionActual(indice)` el valor del día. Con eso se calcula `monto_individual_pesos = cantidad_unidades × valor_unitario_ars`.

### Módulo 5 · Congelamiento de Montos
Scheduler/Cron Job que fija el valor en pesos el día hábil previo a cada colecta, persistiéndolo en `precio_referencia` y en `monto_individual_pesos`. En ese mismo momento copia a la colecta el `indice_referencia` y la `cantidad_unidades` de la votación del ciclo (Módulo 4): `monto_individual_pesos = cantidad_unidades × valor_unitario_ars`.
**Clases:** `CongelamientoScheduler`, `PrecioReferencia`, `CongelamientoService`.
```
GET    /api/precios-referencia?indice=nafta_ypf&fecha=2026-06-29
POST   /api/precios-referencia/congelar/{colectaId}
```

### Módulo 6 · Aportes y Pagos
Registra la decisión de participación (`participa`) y el estado de pago de cada participante por colecta, resolviendo el problema de transparencia planteado en la propuesta original. Aplica una regla de visibilidad por autorización a nivel de recurso: cada participante ve únicamente su propia entrada; solo el recaudador de esa colecta puntual (`recaudador_id`, Módulo 3) puede ver el estado de todos y el resumen agregado. Este filtro se resuelve siempre en el backend — nunca alcanza con ocultarlo en el frontend, porque la respuesta completa quedaría expuesta a cualquiera que inspeccione la llamada a la API.
**Clases:** `Aporte` (embebido, con campo `participa`), `AporteController`, `AporteService` (paquete `backend/.../aportes`). La deuda pendiente la resuelve `AporteService`; no hizo falta un `ReporteDeudaService` aparte.
```
GET    /api/colectas/{id}/aportes              # recaudador: array completo · participante: solo su propia entrada
PATCH  /api/colectas/{id}/aportes/{padreId}     # registra decisión de participación y/o marca el pago
GET    /api/colectas/{id}/deuda-pendiente       # solo recaudador
GET    /api/colectas/{id}/resumen               # solo recaudador: recaudado vs. monto_total_objetivo, cantidad de pendientes
```

**Reglas que aplica el backend:** solo el recaudador registra pagos (403 si no); no se registran pagos hasta que el monto esté congelado (409); en una colecta cerrada no se modifica nada (403); si alguien decide no participar, su aporte vuelve a no pagado.

**Aportes de cada colecta:** las colectas que genera el Módulo 3 nacen sin aportes. La primera vez que se consultan, `AporteService` crea uno por cada participante activo, menos el padre del cumpleañero, con `participa: null` y `pagado: false`. Si después se suma un participante, también se le agrega su aporte (solo en colectas abiertas).

**Privacidad:** en `Colecta` el campo `aportes` lleva `@JsonIgnore`, así `GET /api/colectas` no expone el estado de todos; los aportes solo se consultan por estos endpoints, que aplican la regla de visibilidad.

**Recordatorios de pago (dentro del MVP, sin mails):** se resuelven en el frontend con los datos que ya devuelven estos endpoints, sin campos ni endpoints nuevos. Al participante que todavía no pagó le aparece un aviso desde que el monto se congela, que sube de tono según los días que pasaron desde el cumpleaños (el festejo y la entrega del regalo suelen ser posteriores). El recaudador tiene dos botones para copiar texto: un recordatorio para el grupo de WhatsApp **sin nombres** (respeta la regla de visibilidad) y uno individual junto a cada pendiente, para mandar por privado.

### Fuera de alcance del MVP

**Módulo 7 · Notificaciones** — enviar automáticamente por mail/push los recordatorios de pago que en el MVP se muestran dentro de la aplicación (Módulo 6), disparados tras el congelamiento (Módulo 5). Documentado como ampliación futura incremental; no requiere cambios en el esquema de datos.

### Responsables por módulo


- **Eugenia:** Arquitectura del frontend, Aportes y Pagos e Índices de Referencia.
- **Cintia:** Colectas y Participantes.
- **Pablo:** Autenticación y Roles, Congelamiento de Montos y pulido de la interfaz de usuario (UI).


---

## 🏗️ Stack Tecnológico Proyectado

| Componente | Tecnología / Proveedor | Descripción |
|---|---|---|
| **Frontend** | React + TypeScript | Permite desarrollar rápidamente una interfaz web modular y tiene abundante documentación y recursos disponibles. |
| **Build del frontend** | Vite | Servidor de desarrollo instantáneo y empaquetado optimizado para producción. |
| **Estilos** | Tailwind CSS v4 | Estilado modular con clases utilitarias dentro de cada componente, generado a partir de tokens de diseño propios (colores, tipografía, radios). Garantiza consistencia visual entre los integrantes: solo se pueden usar los valores del sistema de diseño. Ver [`docs/diseno.md`](docs/diseno.md). |
| **Navegación** | React Router | Manejo de rutas y pantallas del frontend. |
| **Íconos** | Lucide | Set único de íconos outline, consistente en toda la interfaz. |
| **Calidad de código (frontend)** | ESLint | Detecta errores y malas prácticas, incluidas las reglas de React Hooks. |
| **Backend** | Java + Spring Boot | Permite mantener Java y aplicar POO. Spring Data MongoDB facilita la integración del backend con MongoDB. |
| **Gestor de dependencias** | Gradle | Permite gestionar las dependencias y automatizar la construcción del proyecto de forma sencilla. |
| **API** | REST | Enfoque simple y ampliamente utilizado para comunicar frontend y backend mediante HTTP y JSON. |
| **Base de datos** | MongoDB Atlas | Permite utilizar MongoDB en la nube sin tener que administrar un servidor de base de datos propio. |
| **Despliegue Frontend** | Netlify | Facilita el despliegue del frontend directamente desde GitHub, con integración continua por rama. |
| **Despliegue Backend** | Render | Permite desplegar el backend sin administrar un servidor propio. Se evaluará el uso de Docker solo si fuera necesario. |
| **Control de versiones** | Git + GitHub | Permite trabajar colaborativamente y cumplir con el requisito de un único repositorio para todo el proyecto. |

---

## 🚀 Cómo correr el proyecto en local

**Backend** (Java 21 + Gradle). Necesita dos variables de entorno, que **nunca** se escriben en archivos del repo:

| Variable | Qué es | De dónde sale |
|---|---|---|
| `MONGODB_URI` | Cadena de conexión a Atlas (`mongodb+srv://usuario:contraseña@cluster...`) | Atlas → Connect → Drivers. Pedir un usuario de base de datos y que habiliten tu IP en *Network Access*. |
| `JWT_SECRET` | Clave para firmar los tokens de sesión (mínimo 32 caracteres) | La elige cada uno para su entorno local. |
| `NAFTA_CSV_URL` | *Opcional.* CSV de precios en surtidor (Módulo 4) | Datos Energía → "Precios en surtidor" → recurso de precios vigentes. Sin ella, la nafta usa el precio cargado a mano. |

En CMD (Windows), desde la carpeta `backend`:

```
set MONGODB_URI=mongodb+srv://...
set JWT_SECRET=una-clave-local-de-al-menos-32-caracteres
gradlew bootRun
```

En Git Bash: `export MONGODB_URI=...`, `export JWT_SECRET=...` y `./gradlew bootRun`. Para solo verificar que compila (sin base de datos): `gradlew compileJava`.

**Pruebas automáticas** (JUnit 5 + Mockito + AssertJ), desde la carpeta `backend`:

```
gradlew test
```

Las pruebas de los módulos usan *mocks* de los repositorios, así que no necesitan base de datos; solo `BackendApplicationTests` (que levanta la aplicación completa) necesita `MONGODB_URI` y `JWT_SECRET`. Para correr únicamente las de un módulo: `gradlew test --tests "com.colectaapp.backend.aportes.*"`. El reporte queda en `backend/build/reports/tests/test/index.html`.

| Prueba | Qué comprueba |
|---|---|
| `aportes/AporteServiceTest` | Regla de visibilidad (participante / recaudador), creación de aportes sin el padre del cumpleañero y sin duplicados, solo el recaudador registra pagos, no se paga sin monto congelado, colecta cerrada no se modifica, deshacer pago, no participar anula el pago, cálculo del resumen. |
| `indices/votacion/VotacionIndiceServiceTest` | Una sola votación por ciclo, opciones válidas, voto único, conteo sin revelar quién votó qué, gana la más votada, empate decidido por el administrador, votación cerrada sin cambios. |
| `indices/cotizaciones/NaftaYpfStrategyTest` | Lectura del CSV de Energía (comas entre comillas, tildes), mediana resistente a valores raros, descarte de precios desactualizados. |

**Frontend:** ver [`frontend/README.md`](frontend/README.md). Para usar el backend real en vez de los datos de prueba, en `frontend/.env` poner `VITE_USAR_MOCKS=false`.

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
├── frontend/              # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── app/           # Router y layout principal
│   │   ├── components/ui/ # Componentes base del sistema de diseño
│   │   ├── features/      # Un módulo por carpeta (auth, colectas, aportes…)
│   │   └── styles/        # tokens.css: tokens de diseño para Tailwind
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # Java + Spring Boot
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   └── build.gradle
│
├── database/          # Esquema de datos y exports de ejemplo (Mongo)
│   ├── esquema_base_datos.md
│   ├── gestion_cumpleanos.padres.json
│   ├── gestion_cumpleanos.colecta_cumpleanos.json
│   └── gestion_cumpleanos.precio_referencia.json
│
├── docs/
│   ├── listado-modulos.md
│   ├── arquitectura.md
│   └── diseno.md          # Sistema de diseño y uso de Tailwind
│
├── .gitignore
└── README.md
```

---

## 🗓️ Plan de Trabajo

| Entrega | Fecha | Alcance |
|---|---|---|
| **1.ª Entrega** | 30/08 | Propuesta del proyecto, definición de alcance (caso de uso escolar), stack tecnológico proyectado y repositorio único de GitHub con los tres integrantes como colaboradores. |
| **2.ª Entrega** | 27/09 | Diseño y listado de módulos del backend, modelo de datos definitivo y cierre de las decisiones de diseño (ver "Esquema de la Base de Datos", "Módulos del Backend" y más abajo). |
| **Entrega Final** | 14/11 | Aplicación funcional desplegada (frontend en Netlify, backend en Render), documentación completa y defensa oral. |

### Decisiones de diseño cerradas en la 2.ª Entrega

* **Asignación del recaudador por colecta:** la primera colecta del ciclo lectivo la organiza un participante voluntario (`es_primera_voluntaria: true`); si se postula más de uno, se asigna al que se postuló primero por orden cronológico. A partir de ahí, el padre cuyo hijo ya recibió la colecta anterior pasa a ser el `recaudador_id` de la colecta siguiente, sosteniendo la lógica de cadena circular. El padre beneficiario de una colecta no aporta económicamente a la colecta de su propio hijo.
* **Alcance de las notificaciones:** los recordatorios de pago se muestran **dentro de la aplicación** y el recaudador puede copiarlos para el grupo de WhatsApp (Módulo 6). El envío automático por mail/push queda **fuera del MVP** y se documenta como ampliación futura (Módulo 7), para no sumar una dependencia externa al alcance del TIF.
* **Índice fijo durante el ciclo:** el índice y la cantidad de unidades se votan una sola vez al inicio del ciclo lectivo y no se modifican durante el año, para que todos los cumpleañeros reciban lo mismo en unidades (Módulo 4).
* **Congelamiento el día hábil anterior:** se mantiene para que el cumpleañero reciba el valor más actualizado posible. Como el festejo y la entrega del regalo suelen ser posteriores al cumpleaños, el período de pago continúa después de esa fecha, acompañado por los recordatorios.
* **Visibilidad del estado de aportes:** dentro de una colecta puntual, cada participante ve únicamente su propio estado (si participa o no, si ya pagó o no); el recaudador de esa colecta es el único que ve el estado de todos y el resumen agregado (Módulo 6). Es una sola regla de autorización a nivel de recurso — no un caso especial para "esconder a los que dijeron que no" — que de paso evita que se pueda deducir por eliminación quién declinó participar.

---

## 🧪 Datos de prueba

Al iniciar el backend se cargan automáticamente, de forma idempotente, un ciclo 2026,
seis participantes con sus niños, una votación cerrada de índice y colectas de ejemplo
con pagos, pendientes y montos sin congelar.

| Usuario | Contraseña | Rol |
|---|---|---|
| `juan.perez@gmail.com` | `Admin123!` | Administrador |
| `maria.gomez@gmail.com` | `Participante123!` | Participante |
| `carlos.fernandez@gmail.com` | `Participante123!` | Participante |
| `laura.paz@gmail.com` | `Participante123!` | Participante |
| `diego.rios@gmail.com` | `Participante123!` | Participante |
| `ana.suarez@gmail.com` | `Participante123!` | Participante |

Los datos demo pueden modificarse desde la aplicación. Al reiniciar el backend vuelven
a su estado inicial.

---

## 👥 Integrantes

| Nombre | Usuario de GitHub |
|---|---|
| Pablo De La Puente | https://github.com/JohnTheMano |
| Eugenia Demarchi | https://github.com/EugeniaDemarchi |
| Cintia García | https://github.com/Cigarcia1307 |


---

