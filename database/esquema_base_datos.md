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
| `indice_referencia` | String | Índice usado para fijar el valor (ej. `"nafta_ypf"`, `"dolar_mep"`). Se fija al congelar el monto (ver sección 4) |
| `cantidad_unidades` | Number / null | Unidades del índice que aporta cada participante (ej. `5` litros). `null` hasta que se congela el monto |
| `aportes` | Array\<Object\> | Registro de pagos individuales de cada participante |

Cada objeto dentro de `aportes`:

| Campo | Tipo | Descripción |
|---|---|---|
| `padre_id` | ObjectId (ref → `padres`) | Quién debe aportar |
| `participa` | Boolean / null | `true` si decidió participar, `false` si decidió no participar, `null` si todavía no respondió |
| `monto_pagado` | Number | Monto efectivamente pagado |
| `fecha_pago` | String / null | Fecha del pago, o `null` si no pagó todavía |
| `pagado` | Boolean | Estado del pago |

> `cantidad_unidades` es un campo agregado en la 2.ª Entrega, aditivo como `participa`: sin él no se puede calcular el monto (`monto_individual_pesos = cantidad_unidades × valor_unitario_ars`). Ver la colección `votacion_indice` (2.4).

> `participa` es un campo agregado en la 2.ª Entrega, aditivo sobre el esquema aprobado en el TP de Bases de Datos II (no modifica ni elimina campos existentes). Permite distinguir "decidió no participar" de "todavía no respondió", algo que antes solo se infería de la ausencia de la entrada en el array. Ver regla de visibilidad en la sección 4.

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
  "cantidad_unidades": 5,
  "aportes": [
    { "padre_id": { "$oid": "6a9dfd0ab9068acfd5061971" }, "participa": true, "monto_pagado": 12000, "fecha_pago": "2026-06-15", "pagado": true },
    { "padre_id": { "$oid": "6a9dfd4ab9068acfd5061973" }, "participa": false, "monto_pagado": 0, "fecha_pago": null, "pagado": false }
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

### 2.4 `votacion_indice`

Registra cada votación del índice de referencia y de la **cantidad de unidades** que aporta cada participante. Hay una al inicio de cada ciclo lectivo y puede haber más durante el año: para cambiar el índice o la cantidad se abre una **nueva votación de todos los participantes**. Se conserva el historial completo (ej. en marzo se eligió nafta, en julio se pasó a dólar MEP).

| Campo | Tipo | Descripción |
|---|---|---|
| `_id` | ObjectId | Identificador único |
| `ciclo_lectivo` | Number | Año del ciclo (ej. 2026) |
| `estado` | String | `"abierta"` (se está votando), `"vigente"` (es la que se aplica hoy) o `"reemplazada"` (la reemplazó una votación posterior) |
| `creada_por` | ObjectId (ref → `padres`) | Administrador que abrió la votación |
| `fecha_apertura` | Date | Cuándo se abrió |
| `fecha_cierre` | Date / null | Cuándo se cerró; `null` mientras está abierta |
| `opciones` | Array\<Object\> | Opciones a votar: cada una es un índice con su cantidad (`indice`, `cantidad_unidades`) |
| `votos` | Array\<Object\> | Un voto por participante (`padre_id`, `indice`, `fecha`) |
| `indice_elegido` | String / null | Índice ganador; se completa al cerrar |
| `cantidad_unidades` | Number / null | Cantidad de la opción ganadora; se completa al cerrar |

> La cantidad va **por opción** y no una sola para todo el ciclo, porque las unidades no son comparables entre índices: 5 litros de nafta no equivalen a 5 dólares ni a 5 cajitas.

> El nombre y la unidad de cada índice ("Nafta súper YPF", "litro/litros") no se guardan en la base: los define cada `CotizacionStrategy` en el backend (Módulo 4).

**Ejemplo:**
```json
{
  "_id": { "$oid": "6b01a2c3d4e5f60718293a4b" },
  "ciclo_lectivo": 2026,
  "estado": "vigente",
  "creada_por": { "$oid": "6a9dec18b9068acfd506196b" },
  "fecha_apertura": { "$date": "2026-03-02T00:00:00.000Z" },
  "fecha_cierre": { "$date": "2026-03-09T00:00:00.000Z" },
  "opciones": [
    { "indice": "nafta_ypf", "cantidad_unidades": 5 },
    { "indice": "dolar_mep", "cantidad_unidades": 5 },
    { "indice": "cajita_feliz", "cantidad_unidades": 1 }
  ],
  "votos": [
    { "padre_id": { "$oid": "6a9dfd0ab9068acfd5061971" }, "indice": "nafta_ypf", "fecha": "2026-03-03" },
    { "padre_id": { "$oid": "6a9dfd4ab9068acfd5061973" }, "indice": "dolar_mep", "fecha": "2026-03-04" }
  ],
  "indice_elegido": "nafta_ypf",
  "cantidad_unidades": 5
}
```

---

## 3. Relaciones entre colecciones

```
padres (1) ──────< colecta_cumpleanos.padre_id       (un padre es beneficiario de N colectas, vía sus hijos)
padres (1) ──────< colecta_cumpleanos.recaudador_id  (un padre puede organizar N colectas)
padres (1) ──────< colecta_cumpleanos.aportes[].padre_id  (un padre puede aportar a N colectas)
precio_referencia.indice ──── colecta_cumpleanos.indice_referencia  (relación lógica, no por ObjectId)
padres (1) ──────< votacion_indice.votos[].padre_id      (un padre vota una vez por votación)
votacion_indice (vigente) ──── colecta_cumpleanos.indice_referencia + cantidad_unidades  (se copian al congelar)
```

No se usan referencias formales (`$lookup`) de forma estricta porque MongoDB es NoSQL; las relaciones se resuelven a nivel de aplicación (backend), consultando por `ObjectId` cuando es necesario.

---

## 4. Reglas de negocio resueltas en esta entrega

La propuesta original (1.ª entrega) dejaba pendiente de definición **quién es el recaudador de cada colecta puntual**. Se resolvió de la siguiente manera:

- La **primera colecta** del ciclo lectivo la organiza un padre **voluntario** (`es_primera_voluntaria: true`).
- A partir de ahí, el padre **cuyo hijo ya recibió** la colecta anterior pasa a ser el `recaudador_id` de la colecta siguiente, sosteniendo la lógica de "cadena circular" descripta en la propuesta.
- El padre beneficiario de una colecta **no aporta económicamente** a la colecta de su propio hijo (no aparece en el array `aportes` de esa colecta).

Este criterio se refleja en los 3 documentos de ejemplo cargados en `colecta_cumpleanos`.

Además, en esta entrega se definió **quién puede ver el array `aportes` completo de una colecta**:

- Dentro de una colecta puntual, cada participante solo puede ver su propia entrada dentro de `aportes` (su `participa` y su `pagado`).
- El `recaudador_id` de esa colecta es el único que puede ver el array completo (todos los `participa` y `pagado` de todos los padres) y un resumen agregado (recaudado vs. `monto_total_objetivo`, cantidad de pendientes).
- Es una sola regla de autorización a nivel de recurso — se compara el `_id` de quien pide los datos contra el `recaudador_id` de esa colecta, no contra un rol genérico (`ADMINISTRADOR`/`PARTICIPANTE`) — y se aplica siempre del lado del backend. De paso resuelve que no se pueda deducir por eliminación quién decidió no participar.

También se definió **cómo se elige el índice y la cantidad de unidades, y cómo se cambian durante el año** (colección `votacion_indice`):

- Al inicio de cada ciclo lectivo el administrador abre una votación con las opciones (índice + cantidad de unidades). Cada participante vota **una sola vez** por votación.
- Solo puede haber **una votación abierta** a la vez. Al cerrarla, la opción más votada pasa a `"vigente"` y la anterior a `"reemplazada"`. En caso de empate, decide el administrador al cerrar.
- Para cambiar el índice o la cantidad a mitad de año se abre una **nueva votación de todos** (no lo cambia el administrador por su cuenta).
- El cambio aplica a **todas las colectas que todavía no se congelaron**. Por eso `indice_referencia` y `cantidad_unidades` se guardan en la colecta recién **al congelar el monto** (día hábil anterior al cumpleaños), junto con `monto_individual_pesos`. Antes de eso, la colecta usa la votación vigente.
- Las colectas ya congeladas o cobradas **no cambian**, aunque después haya otra votación: los participantes ya pagaron ese monto.

---

## 5. Datos de prueba cargados

| Colección | Cantidad de documentos |
|---|---|
| `padres` | 3 (Juan Pérez/Tomás, María Gómez/Sofía, Carlos Fernández/Valentina) |
| `colecta_cumpleanos` | 3 (una por cada beneficiario, en orden de rueda 1, 2, 3) |
| `precio_referencia` | 4 (nafta x2 fechas, dólar MEP, cajita feliz) |

Los archivos de exportación (`padres.json`, `colecta_cumpleanos.json`, `precio_referencia.json`) se incluyen en la carpeta `/database` del repositorio como respaldo de estos datos de ejemplo.

---

## 6. Índices principales

Para optimizar las consultas más frecuentes del sistema se definen los siguientes índices:

### Colección `padres`
- `email`: índice único para evitar usuarios duplicados y facilitar la búsqueda durante el inicio de sesión.
- `activo`: facilita la consulta de participantes activos.

### Colección `colecta_cumpleanos`
- `ciclo_lectivo`: facilita la búsqueda de colectas correspondientes a un ciclo determinado.
- `recaudador_id`: facilita la consulta de las colectas asignadas a cada recaudador.
- `padre_id`: facilita la búsqueda de colectas asociadas a un participante.
- `fecha_cumpleanos`: facilita el ordenamiento y búsqueda de colectas por fecha.

### Colección `precio_referencia`
- Índice compuesto por `indice` y `fecha`: permite obtener rápidamente la cotización de un índice para una fecha determinada.

### Colección `votacion_indice`
- Índice compuesto por `ciclo_lectivo` y `estado`: permite obtener rápidamente la votación vigente o la abierta de un ciclo.
