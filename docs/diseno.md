# Sistema de diseño — ColectaApp

Guía de uso para todo el equipo. **Si necesitás un color, tamaño o sombra que no está acá, no lo inventes en el componente: proponelo y se agrega al sistema.**

## 0. Cómo se estila en este proyecto: Tailwind CSS v4

El frontend se estila con **Tailwind CSS v4**. No hay archivos `.css` por componente: cada componente escribe sus estilos como clases utilitarias en su propio JSX (`className="rounded-card bg-superficie p-4"`). Así el estilo vive junto al componente que lo usa, se puede borrar o mover sin dejar CSS huérfano, y dos personas no se pisan editando la misma hoja de estilos.

Dónde está cada cosa:

| Qué | Dónde |
|---|---|
| Integración con Vite | `frontend/vite.config.ts` (plugin `@tailwindcss/vite`; no hay `tailwind.config.js`) |
| Tokens: colores, tipografía, radios, sombras | `frontend/src/styles/tokens.css`, bloque `@theme` |
| Punto de entrada de estilos | `frontend/src/index.css` (solo importa los tokens) |
| Componentes base ya estilados | `frontend/src/components/ui/` |
| Guía visual en vivo | Ruta `/diseno` de la app (`npm run dev` → `http://localhost:5173/diseno`) |

Reglas:

1. **La paleta por defecto de Tailwind está desactivada.** `bg-red-500`, `text-sm` o `shadow-lg` no generan nada. Solo existen las clases que salen de los tokens de esta guía (`bg-tinta`, `text-caption`, `shadow-sutil`, etc.).
2. **Primero, los componentes de `components/ui`.** Antes de estilar un botón, una card o un estado a mano, usá `<Boton>`, `<Card>`, `<PillEstado>` o `<AvatarCumpleanero>`. Si falta una variante, se agrega al componente, no a la pantalla.
3. **Las clases se escriben completas.** Tailwind lee el código como texto: `` `bg-confeti-${color}` `` no funciona. Usá un mapa con las clases enteras (ver `lib/confeti.ts` o `PillEstado.tsx`).
4. **Nada de `style={{…}}` ni CSS nuevo** salvo casos excepcionales justificados en el Pull Request.
5. **Mobile-first.** Las clases sin prefijo son para celular; `md:` aplica desde 768px (escritorio).

Recomendado en VS Code: extensión **Tailwind CSS IntelliSense**, que autocompleta las clases del sistema y muestra cada color.

## 1. Concepto

ColectaApp = comunidad + celebración + organización. Cálida, alegre y adulta.

**Regla general:** la interfaz puede ser divertida; la información debe ser clara y organizada.

| La diversión va en… | La diversión NO va en… |
|---|---|
| Estados vacíos, ilustraciones, confirmaciones, la rueda de colectas, avatares de cumpleañeros | Montos, tablas, formularios, mensajes de error |

## 2. Paleta "Confeti"

La estrategia: **la acción es sobria (tinta) y el color cuenta quién cumple años.** Cada cumpleañero tiene un color confeti propio y estable en toda la app.

### Base

| Token | Hex | Uso |
|---|---|---|
| `crema` | `#FFF8F0` | Fondo general |
| `superficie` | `#FFFFFF` | Cards y paneles |
| `tinta` | `#2E2724` | Texto principal **y botón primario** |
| `tinta-hover` | `#4A403B` | Hover del botón primario |
| `texto-suave` | `#6E625B` | Texto secundario, etiquetas |
| `borde` | `#E8DED5` | Divisores decorativos |
| `borde-control` | `#958679` | Borde de inputs, selects y checkboxes |

No usar negro puro (`#000`) en ningún lado.

### Confeti (identidad)

| Token | Hex |
|---|---|
| `confeti-mostaza` | `#FFC233` |
| `confeti-turquesa` | `#2EC4B6` |
| `confeti-coral` | `#FF8A65` |
| `confeti-lila` | `#B39DFF` |
| `confeti-cielo` | `#7CC4F8` |

Reglas:
- **Solo decorativos:** avatar del cumpleañero, borde superior de su card, ilustraciones, rueda de colectas.
- **Texto encima: siempre `text-tinta`** (todas las combinaciones superan 6,3:1).
- **Nunca** como color de texto, de botón ni de estado.
- El color de cada cumpleañero sale de **su lugar en la rueda** (`colecta.ordenEnLaRueda`): 1 mostaza, 2 turquesa, 3 coral, 4 lila, 5 cielo, y vuelve a empezar. Así dos cumpleaños consecutivos nunca comparten color. Se obtiene con `colorCumpleanero(orden)` de `src/lib/confeti.ts`; no elegirlo a mano.

### Estados

Siempre **icono + texto** dentro de una pill (`rounded-full`). El color nunca es la única señal.

| Estado | Clases | Icono (Lucide) |
|---|---|---|
| Pagado | `bg-pagado-bg text-pagado` | `CircleCheck` |
| Pendiente | `bg-pendiente-bg text-pendiente` | `Clock` |
| Monto congelado | `bg-congelado-bg text-congelado` | `Snowflake` |
| No participa | `bg-no-participa-bg text-no-participa` | `Minus` |
| Error | `bg-error-bg text-error` | `TriangleAlert` |

**Mensajes de error en bloque:** fondo `superficie` con borde `border-error` (no relleno), para que no se confundan con superficies informativas.

## 3. Tipografía

Familia única: **Nunito** (pesos 400, 600, 700, 800). Se carga en `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
```

| Clase | Tamaño | Uso |
|---|---|---|
| `text-caption` | 13px | Etiquetas, metadatos, fechas |
| `text-body` | 16px | Texto general (default) |
| `text-lead` | 18px | Destacados |
| `text-h3` / `text-h2` / `text-h1` | 20 / 24 / 30px | Títulos |
| `text-monto` | 32px | Monto principal del aporte |

- Títulos: `font-extrabold` (800). Botones y labels: `font-bold` (700). Texto: normal (400).
- **Todo número que represente plata o cantidades lleva `tabular-nums`**, para que alinee en columnas.
- Formato de montos: `Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })`.

## 4. Formas, espaciado y sombras

| Elemento | Clase |
|---|---|
| Botones, pills de estado, avatares | `rounded-full` |
| Inputs y selects | `rounded-control` (14px) |
| Cards | `rounded-card` (20px) |
| Modales, contenedores grandes | `rounded-panel` (28px) |

- Espaciado: escala de Tailwind (múltiplos de 4px). Padding interno de cards: `p-4` en mobile, `p-6` en desktop.
- Sombras: `shadow-sutil` para cards que necesitan separarse del fondo; `shadow-elevado` solo para modales y menús flotantes. La mayoría de los elementos no lleva sombra.

## 5. Componentes base

Viven en `frontend/src/components/ui/` y se importan desde un único lugar:

```tsx
import { AvatarCumpleanero, Boton, Card, PillEstado } from '../../../components/ui'
import { formatearARS } from '../../../lib/formato'

// Botones: primario (uno solo por pantalla), secundario y texto
<Boton>Ya transferí</Boton>
<Boton variante="secundario">Copiar alias</Boton>
<Boton variante="texto">No participo esta vez</Boton>

// Card de un cumpleañero: el borde superior toma su color confeti
<Card ordenEnLaRueda={colecta.ordenEnLaRueda} elevada>…</Card>

// Estado: siempre con ícono + texto
<PillEstado estado="pendiente" />

// Avatar del cumpleañero (en gris si su cumpleaños ya pasó)
<AvatarCumpleanero ordenEnLaRueda={colecta.ordenEnLaRueda} nombre={colecta.beneficiarioNombre} pasado={yaFue} />

// Monto
<p className="text-monto font-extrabold tabular-nums">{formatearARS(monto)}</p>
```

Para lo que todavía no tiene componente, la receta con clases:

```tsx
// Input
<input className="w-full rounded-control border border-borde-control bg-superficie px-4 py-3 text-body placeholder:text-texto-suave" />
```

### Aviso "Te toca recaudar"

Card con fondo `bg-confeti-mostaza` y texto tinta. **Es destacada a propósito**: cuando a un participante le toca ser recaudador tiene que notarlo de inmediato. Es la única excepción a la regla de que el confeti no se usa como fondo de bloques de información; no bajarle el peso en el pulido de UI.

Iconos: **Lucide** (`lucide-react`), estilo outline, tamaño 16–20px. Íconos decorativos con `aria-hidden`; botones solo-icono con `aria-label`.

## 6. Recurso gráfico propio: la rueda

Círculos (los cumpleañeros, cada uno en su color confeti) dispuestos sobre un anillo. Representa la cadena circular de colectas. Se usa como identidad (encabezado, login, estados vacíos, próximo turno), **no** como decoración de fondo permanente.

## 7. Recordatorio de visibilidad (regla de negocio)

El participante **solo ve su propio estado**. Ningún componente de su vista muestra estados de otros participantes (ni avatares con check de pagado, ni barra de progreso del total). La barra de progreso y la lista de estados son exclusivas de la vista del recaudador, y el filtro se hace en el backend.

## 8. Accesibilidad mínima

- Contraste AA verificado para todas las combinaciones de esta guía.
- Foco visible: definido globalmente en `tokens.css`. No usar `outline-none` sin reemplazo.
- Mobile-first: todo componente se diseña primero a 360px de ancho.
