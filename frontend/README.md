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
