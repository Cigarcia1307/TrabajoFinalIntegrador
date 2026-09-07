# Esquema de Base de Datos — Plataforma de Colectas Indexadas y Circulares

**2.ª Entrega — Diseño y Módulos**
Trabajo Final Integrador — Tecnicatura Universitaria en Programación a Distancia (UTN)

---

## 1. Motor de base de datos

**MongoDB Atlas** (NoSQL, orientado a documentos), tal como fue definido en la propuesta original y ya evaluado en el Trabajo Práctico Integrador de Bases de Datos II. 
Base de datos: `gestion_cumpleanos`

---

## 2. Colecciones

### 2.1 `padres`

Representa a los participantes del sistema (padres del colegio). Cada padre puede tener uno o más hijos, modelados como **documentos embebidos** dentro de un array.

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único autogenerado |
| `nombre` | String | Nombre del padre/participante |
| `apellido` | String | Apellido del padre/participante |
| `email` | String | Usado para login y notificaciones |
| `telefono` | String | Contacto |
| `cbu_alias` | String | Para recibir transferencias cuando organiza una colecta |
| `activo` | Boolean | Soporta la **baja lógica** (el participante nunca se borra físicamente, se marca `false`) |
| `hijos` | Array\<Object\> | Beneficiarios embebidos |

Cada objeto dentro de `hijos`:

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | String | Nombre del hijo/a (beneficiario) |
| `fecha_nacimiento` | String (ISO date) | Determina el orden de la rueda anual |

**Ejemplo:**
```json
{
  "_id": { "$oid": "6a9dec18b9068acfd506196b" },
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@gmail.com",
  "telefono": "3511234567",
  "cbu_alias": "juan.perez.mp",
  "activo": true,
  "hijos": [
    { "nombre": "Tomás", "fecha_nacimiento": "2015-03-20" }
  ]
}
```

---

### 2.2 `colecta_cumpleanos`

Representa cada colecta puntual organizada durante el ciclo lectivo.

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único |
| `ciclo_lectivo` | Number | Año del ciclo (ej. 2026) |
| `fecha_cumpleanos` | Date | Fecha del cumpleaños del beneficiario |
| `beneficiario_nombre` | String | Nombre del hijo/a por el cual se organiza la colecta |
| `padre_id` | ObjectId (ref → `padres`) | Padre del beneficiario |
| `monto_individual_pesos` | Number | Monto que cada participante debe aportar |
| `monto_total_objetivo` | Number | Monto total a recaudar |
| `estado_colecta` | String | Ej: `"en_recaudacion"`, `"cerrada"` |
| `activo` | Boolean | Baja lógica |
| `orden_en_la_rueda` | Number | Posición en la cadena circular del ciclo (1, 2, 3...) |
| `recaudador_id` | ObjectId (ref → `padres`) | Padre responsable de cobrar **esta** colecta |
| `es_primera_voluntaria` | Boolean | `true` solo en la colecta N.º 1, donde el recaudador se ofreció voluntariamente |
| `indice_referencia` | String | Índice usado para fijar el valor (ej. `"nafta_ypf"`, `"dolar_mep"`) |
| `aportes` | Array\<Object\> | Registro de pagos individuales de cada participante |

Cada objeto dentro de `aportes`:

| Campo | Tipo | Descripción |
|---|---|---|
| `padre_id` | ObjectId (ref → `padres`) | Quién debe aportar |
| `monto_pagado` | Number | Monto efectivamente pagado |
| `fecha_pago` | String / null | Fecha del pago, o `null` si no pagó todavía |
| `pagado` | Boolean | Estado del pago |

**Ejemplo:**
```json
{
  "_id": { "$oid": "6a3ef48602603a0a325ccf74" },
  "ciclo_lectivo": 2026,
  "fecha_cumpleanos": { "$date": "2026-06-30T00:00:00.000Z" },
  "beneficiario_nombre": "Tomás",
  "padre_id": { "$oid": "6a9dec18b9068acfd506196b" },
  "monto_individual_pesos": 12000,
  "monto_total_objetivo": 95000,
  "estado_colecta": "en_recaudacion",
  "activo": false,
  "orden_en_la_rueda": 1,
  "recaudador_id": { "$oid": "6a9dec18b9068acfd506196b" },
  "es_primera_voluntaria": true,
  "indice_referencia": "nafta_ypf",
  "aportes": [
    { "padre_id": { "$oid": "6a9dfd0ab9068acfd5061971" }, "monto_pagado": 12000, "fecha_pago": "2026-06-15", "pagado": true },
    { "padre_id": { "$oid": "6a9dfd4ab9068acfd5061973" }, "monto_pagado": 0, "fecha_pago": null, "pagado": false }
  ]
}
```

---

### 2.3 `precio_referencia`

Guarda las cotizaciones históricas de los índices utilizados para congelar los montos y evitar la pérdida de poder adquisitivo por inflación.

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único |
| `indice` | String | Nombre del índice (ej. `"nafta_ypf"`, `"dolar_mep"`, `"cajita_feliz"`) |
| `fecha` | String (ISO date) | Fecha de la cotización |
| `valor_unitario_ars` | Number | Valor en pesos de una unidad de ese índice en esa fecha |

**Ejemplo:**
```json
{
  "indice": "nafta_ypf",
  "fecha": "2026-06-29",
  "valor_unitario_ars": 1250
}
```

En el sistema final, estos documentos se generarán automáticamente mediante un **Scheduler/Cron Job** en el backend (Spring Boot), que consulta APIs externas usando el patrón **Strategy** descripto en la propuesta (sección 1.5), en lugar de cargarse manualmente como en este prototipo de datos de ejemplo.

---

## 3. Relaciones entre colecciones

```
padres (1) ──────< colecta_cumpleanos.padre_id       (un padre es beneficiario de N colectas, vía sus hijos)
padres (1) ──────< colecta_cumpleanos.recaudador_id  (un padre puede organizar N colectas)
padres (1) ──────< colecta_cumpleanos.aportes[].padre_id  (un padre puede aportar a N colectas)
precio_referencia.indice ──── colecta_cumpleanos.indice_referencia  (relación lógica, no por ObjectId)
```

No se usan referencias formales (`$lookup`) de forma estricta porque MongoDB es NoSQL; las relaciones se resuelven a nivel de aplicación (backend), consultando por `ObjectId` cuando es necesario.

---

## 4. Reglas de negocio resueltas en esta entrega

La propuesta original (1.ª entrega) dejaba pendiente de definición **quién es el recaudador de cada colecta puntual**. Se resolvió de la siguiente manera:

- La **primera colecta** del ciclo lectivo la organiza un padre **voluntario** (`es_primera_voluntaria: true`).
- A partir de ahí, el padre **cuyo hijo ya recibió** la colecta anterior pasa a ser el `recaudador_id` de la colecta siguiente, sosteniendo la lógica de "cadena circular" descripta en la propuesta.
- El padre beneficiario de una colecta **no aporta económicamente** a la colecta de su propio hijo (no aparece en el array `aportes` de esa colecta).

Este criterio se refleja en los 3 documentos de ejemplo cargados en `colecta_cumpleanos`.

---

## 5. Datos de prueba cargados

| Colección | Cantidad de documentos |
|---|---|
| `padres` | 3 (Juan Pérez/Tomás, María Gómez/Sofía, Carlos Fernández/Valentina) |
| `colecta_cumpleanos` | 3 (una por cada beneficiario, en orden de rueda 1, 2, 3) |
| `precio_referencia` | 4 (nafta x2 fechas, dólar MEP, cajita feliz) |

Los archivos de exportación (`padres.json`, `colecta_cumpleanos.json`, `precio_referencia.json`) se incluyen en la carpeta `/database` del repositorio como respaldo de estos datos de ejemplo.
