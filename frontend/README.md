# ColectaApp — Frontend

Interfaz web de ColectaApp: **React + TypeScript**, construida con **Vite** y estilada con **Tailwind CSS v4**.

## Cómo levantarlo

Requiere Node 20.19 o superior.

```bash
cd frontend
npm install      # solo la primera vez o cuando cambie package.json
npm run dev      # servidor de desarrollo en http://localhost:5173
```

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Verifica tipos y genera la versión de producción en `dist/` |
| `npm run lint` | Revisa el código con ESLint |
| `npm run preview` | Sirve localmente la versión de producción |

## Librerías

| Librería | Para qué se usa |
|---|---|
| **React 19 + TypeScript** | Componentes de la interfaz, con tipado |
| **Vite** | Servidor de desarrollo y empaquetado |
| **Tailwind CSS v4** (`tailwindcss` + `@tailwindcss/vite`) | Estilado con clases utilitarias a partir de los tokens del sistema de diseño |
| **React Router** | Navegación entre pantallas |
| **Lucide** (`lucide-react`) | Íconos (estilo outline) |
| **ESLint** | Revisión de código, con reglas de React Hooks |

## Estilado con Tailwind

No hay archivos CSS por componente. Cada componente se estila con clases de Tailwind, y esas clases **solo pueden usar los valores definidos en el sistema de diseño**:

- `src/styles/tokens.css` define colores, tipografía, radios y sombras con el bloque `@theme` de Tailwind v4. La paleta por defecto de Tailwind está desactivada: `bg-red-500` o `text-sm` no generan nada.
- `src/components/ui/` tiene los componentes base (`Boton`, `Card`, `PillEstado`, `AvatarCumpleanero`). Antes de estilar algo a mano, revisá si ya existe ahí.
- La guía de uso completa está en [`docs/diseno.md`](../docs/diseno.md), y la guía visual en vivo, en la ruta **`/diseno`** de la app.

Recomendado en VS Code: la extensión **Tailwind CSS IntelliSense**, que autocompleta las clases y muestra los colores del sistema.

## Estructura

```text
src/
├── app/                 # Router, layout principal, página de error y guía /diseno
├── components/
│   ├── ui/              # Componentes base del sistema de diseño (compartidos)
│   └── marca/           # Logo e identidad
├── features/            # Un módulo por carpeta, igual que en el backend
│   ├── auth/            # Módulo 1 · Autenticación y Roles      (Pablo)
│   ├── participantes/   # Módulo 2 · Participantes              (Cintia)
│   ├── colectas/        # Módulo 3 · Colectas                   (Cintia)
│   ├── indices/         # Módulo 4 · Índices de Referencia      (Eugenia)
│   ├── congelamiento/   # Módulo 5 · Congelamiento de Montos    (Pablo)
│   └── aportes/         # Módulo 6 · Aportes y Pagos            (Eugenia)
├── lib/                 # Utilidades (formato de montos, color confeti)
├── services/            # Cliente de la API y datos mock
├── styles/tokens.css    # Tokens de diseño (Tailwind @theme)
└── types/               # Tipos compartidos que reflejan el contrato de la API
```

Cada módulo guarda sus pantallas en `features/<modulo>/pages/` y, si los necesita, sus componentes propios en `features/<modulo>/components/`. Lo que usan dos o más módulos va en `components/ui/`.

## Datos: mocks y API real

Las pantallas **nunca llaman a `fetch` directamente**. Piden los datos a las funciones de `src/services/`, que devuelven exactamente la forma de los endpoints del README:

```tsx
import { listarColectas, obtenerMiAporte } from '../../../services'

const colectas = await listarColectas(2026)              // GET /api/colectas?ciclo=2026
const miAporte = await obtenerMiAporte(colectaId, yo.id)  // GET /api/colectas/{id}/aportes
```

Mientras el backend no esté listo, esas funciones responden con **datos de prueba** (`src/services/mocks/datos.ts`): un grupo de 6 familias en el ciclo 2026, con colectas cerradas, una en curso con el monto congelado (Martina) y dos con monto todavía estimado. Cuando el backend esté disponible, se cambia una variable y las pantallas no se tocan:

1. Copiar `.env.example` como `.env.local` (no se sube a GitHub).
2. Poner `VITE_USAR_MOCKS=false` y la dirección del backend en `VITE_API_URL`.
3. Reiniciar `npm run dev`.

| Servicio | Módulo | Funciones |
|---|---|---|
| `auth.ts` | 1 · Autenticación | `obtenerUsuarioActual` |
| `participantes.ts` | 2 · Participantes | `listarParticipantes`, `obtenerParticipante` |
| `colectas.ts` | 3 · Colectas | `listarCiclos`, `listarColectas`, `obtenerColecta`, `obtenerRecaudadorId` |
| `indices.ts` | 4 · Índices | `listarIndices`, `obtenerIndiceElegido`, `obtenerCotizacionActual`, `votarIndice`, `obtenerMiVoto` |
| `congelamiento.ts` | 5 · Congelamiento | `obtenerPrecioReferencia`, `estaCongelado` |
| `aportes.ts` | 6 · Aportes y Pagos | `obtenerAportes`, `obtenerMiAporte`, `actualizarAporte`, `obtenerResumen`, `obtenerDeudaPendiente` |

Los tipos de todos los datos están en `src/types/api.ts`.

### Regla de visibilidad

Los mocks aplican la misma regla que el backend: **cada participante ve solo su propio aporte; el recaudador de esa colecta ve el de todos y el resumen.** Si un participante pide el resumen, recibe un error 403, igual que con la API real. Así ninguna pantalla se arma mostrando datos que el backend no va a entregar.

### Probar como otro usuario

En modo mocks, el usuario logueado por defecto es **María** (participante, con su aporte pendiente en la colecta de Martina). Para ver otras vistas, en la consola del navegador (F12):

```js
localStorage.setItem('colectaapp.usuarioMock', '6a9dfd4ab9068acfd5061973') // Carlos: recaudador de la colecta de Martina
localStorage.setItem('colectaapp.usuarioMock', '6a9dec18b9068acfd506196b') // Juan: ADMINISTRADOR
localStorage.setItem('colectaapp.usuarioMock', '6a9e10aab9068acfd5061975') // Laura: mamá de Martina (no aporta a su colecta)
localStorage.removeItem('colectaapp.usuarioMock')                          // volver a María
```

y recargar la página. Los cambios que se hagan (marcar pagos, votar) duran hasta recargar.
