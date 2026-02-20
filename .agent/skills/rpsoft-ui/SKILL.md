---
name: RPSoft UI
description: >
  Skill de diseño y maquetación para el sistema de control horario RPSoft.
  Define el stack fijo (React + CSS vanilla), las reglas de layout del dashboard,
  convenciones de componentes, paleta de colores en tema oscuro, directrices de
  accesibilidad básica y el Definition of Done (DoD) de UI.
---

# RPSoft UI Skill

## Stack fijo

| Capa      | Tecnología                      |
| --------- | ------------------------------- |
| Framework | React 18 (Vite)                 |
| Estilos   | CSS vanilla (módulos si aplica) |
| Routing   | React Router v6                 |
| Backend   | Supabase (JS client v2)         |

> **Regla:** No se permite introducir librerías de UI externas (MUI, Chakra, Tailwind, etc.) sin aprobación explícita.

---

## Layout del dashboard

El dashboard sigue una estructura de **dos columnas fijas**:

```
┌────────────┬──────────────────────────────┐
│  Sidebar   │      Contenido principal     │
│  (240 px)  │      (flex: 1)               │
└────────────┴──────────────────────────────┘
```

### Reglas de layout

1. **Contenedor raíz** (`#app-shell`): `display: flex; height: 100vh; overflow: hidden`.
2. **Sidebar** (`.sidebar`):
   - Ancho fijo: `240px`.
   - Altura: `100vh`, con `overflow-y: auto` para contenido largo.
   - Siempre visible en desktop; en mobile se convierte en drawer off-canvas.
3. **Contenido principal** (`.main-content`):
   - `flex: 1; overflow-y: auto; padding: 24px`.
   - No tiene ancho máximo definido; se adapta al espacio restante.
4. **Mobile** (`max-width: 768px`):
   - El sidebar se oculta (`transform: translateX(-100%)`) y se activa con un botón hamburguesa.
   - El `.main-content` ocupa el `100%` del ancho.

---

## Convenciones de componentes

### Naming

| Elemento              | Convención                  | Ejemplo               |
| --------------------- | --------------------------- | --------------------- |
| Componente React      | PascalCase                  | `WorkSessionCard`     |
| Archivo de componente | PascalCase + `.jsx`         | `WorkSessionCard.jsx` |
| Hook personalizado    | camelCase con prefijo `use` | `useWorkSession`      |
| Archivo de servicio   | camelCase + `Service.js`    | `sessionsService.js`  |
| Archivo de utilidad   | camelCase + `Utils.js`      | `dateUtils.js`        |

### Estructura de un componente

```jsx
// 1. Imports externos
import { useState } from "react";

// 2. Imports internos (servicios, hooks, otros componentes)
import { getSession } from "../services/sessionsService";

// 3. Definición del componente (PascalCase obligatorio)
export default function WorkSessionCard({ session }) {
  // 4. Estado y efectos arriba
  const [loading, setLoading] = useState(false);

  // 5. Handlers con prefijo handle
  function handleClick() {
    /* … */
  }

  // 6. JSX al final
  return <article className="work-session-card">{/* contenido */}</article>;
}
```

### Naming de clases CSS

- Usar **kebab-case**: `.work-session-card`, `.sidebar-nav-item`.
- Prefijo del componente para evitar colisiones: `.tracker-`, `.history-`, `.sidebar-`.
- Estado con sufijo: `.btn--active`, `.card--disabled`, `.nav-item--selected`.

---

## Paleta de colores — Tema oscuro

```css
:root {
  /* Fondos */
  --color-bg-base: #0f1117; /* Fondo global */
  --color-bg-surface: #1a1d27; /* Tarjetas, paneles */
  --color-bg-elevated: #252836; /* Modales, dropdowns */
  --color-bg-sidebar: #13151f; /* Sidebar */

  /* Acento principal */
  --color-accent: #6c63ff; /* Púrpura RPSoft */
  --color-accent-hover: #5a52d5;
  --color-accent-light: #6c63ff22; /* Fondo suave de acento */

  /* Textos */
  --color-text-primary: #e8eaf0;
  --color-text-secondary: #9598a8;
  --color-text-muted: #5c5f70;

  /* Bordes */
  --color-border: #2a2d3e;
  --color-border-focus: #6c63ff;

  /* Semánticos */
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;
}
```

> Usar siempre las variables CSS; **nunca** valores hex directos en los archivos de componente.

---

## Accesibilidad básica

1. **Contraste mínimo**: texto sobre fondo debe cumplir ratio ≥ 4.5:1 (WCAG AA).
2. **Focus visible**: todos los elementos interactivos deben tener `:focus-visible` con `outline: 2px solid var(--color-border-focus)`.
3. **Labels semánticos**: inputs siempre con `<label>` asociado (`for`/`htmlFor`) o `aria-label`.
4. **Roles ARIA**: usar elementos HTML nativos antes que `role="button"` etc.
5. **Imágenes**: siempre con atributo `alt`. Si es decorativa, `alt=""`.
6. **Navegación por teclado**: sidebar y modales deben ser navegables con Tab/Shift+Tab y cerrables con Escape.

---

## DoD UI — Definition of Done

Un componente o vista se considera **terminado** cuando cumple todos los puntos:

- [ ] Sin errores ni warnings en consola del navegador.
- [ ] Responsive: funciona correctamente en mobile (`≤ 768px`) y desktop (`≥ 1024px`).
- [ ] Todos los componentes tienen nombres en **PascalCase**.
- [ ] Clases CSS en **kebab-case** con prefijo de componente.
- [ ] Solo se usan variables de la paleta (`--color-*`), sin hex directos.
- [ ] Elementos interactivos tienen estado `:focus-visible` visible.
- [ ] No hay reglas CSS inline (el atributo `style` se reserva para valores dinámicos).
- [ ] El PR incluye captura de pantalla en mobile y desktop.
