# Sistema de Control Horario

Aplicación web moderna diseñada para el registro, seguimiento y gestión de jornadas laborales de manera eficiente. Construida utilizando tecnologías actuales como React, Vite y Supabase.

## 🚀 Funcionalidades Principales

La aplicación se estructura en tres módulos clave:

- **🔐 Acceso y Autenticación**:
  - Sistema seguro de **Inicio de Sesión** y **Registro** de usuarios mediante Supabase Auth.
  - Gestión automática de sesiones y protección de rutas.

- **⏱️ Registro de Jornada (Panel Principal)**:
  - **Iniciar Jornada**: Comienza el conteo de tiempo laboral.
  - **Pausar/Reanudar**: Permite registrar descansos sin perder el progreso.
  - **Finalizar Jornada**: Guarda el registro total en la base de datos.
  - **Cronómetro en tiempo real**: Visualización clara del tiempo transcurrido.
  - **Estado actual**: Indicadores visuales (Activo, Pausado, Inactivo).
  - Cálculo automático de las horas totales trabajadas en la sesión actual.

- **📅 Historial de Registros**:
  - Consulta detallada de todas las jornadas laborales anteriores.
  - Información completa: Fecha, Hora de inicio, Hora de fin y Tiempo total.
  - Almacenamiento seguro y persistente en la nube (Base de Datos Supabase).

## 🛠️ Tecnologías Implementadas

- **[React](https://react.dev/)**: Biblioteca líder para interfaces de usuario interactivas.
- **[Vite](https://vitejs.dev/)**: Entorno de desarrollo ultrarrápido y optimizado.
- **[Supabase](https://supabase.com/)**: Plataforma de Backend como Servicio (BaaS) que provee autenticación y base de datos PostgreSQL.
- **CSS3 Moderno**: Diseño visual profesional con tema oscuro ("Dark Mode") y completamente adaptable a móviles (Responsive).

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 16 o superior).
- [npm](https://www.npmjs.com/) (gestor de paquetes incluido con Node.js).
- Una cuenta activa y un proyecto configurado en [Supabase](https://supabase.com/).

## 🔧 Guía de Instalación

1. **Clonar el repositorio**:
   Descarga el código fuente a tu máquina local:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd control-horario
   ```

2. **Instalar dependencias**:
   Instala las librerías necesarias con npm:
   ```bash
   npm install
   ```

## ⚙️ Configuración del Entorno

Para conectar la aplicación con tu base de datos en Supabase, necesitas configurar las variables de entorno.

1. Crea un archivo llamado `.env` en la carpeta raíz del proyecto (basado en el ejemplo):

   ```bash
   cp .env.example .env
   ```

   _(Si estás en Windows y el comando `cp` no funciona, simplemente copia y renombra el archivo `.env.example` manualmente a `.env`)_

2. Abre el archivo `.env` y coloca tus claves de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase_aqui
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
   ```
   > **¿Dónde obtengo estas claves?** Ve a tu panel de Supabase -> `Settings` (Configuración) -> `API`.

## ▶️ Ejecución del Proyecto

Para iniciar el servidor de desarrollo en tu máquina local:

```bash
npm run dev
```

Una vez iniciado, abre tu navegador y visita: `http://localhost:5173/` (o la dirección que muestre tu terminal).

## 📂 Estructura de Archivos

Una vista general de cómo está organizado el código:

```
src/
├── components/
│   ├── Login.jsx           # Interfaz de Inicio de Sesión
│   ├── Signup.jsx          # Interfaz de Registro de Usuario
│   ├── Dashboard.jsx       # Panel Principal y Navegación
│   ├── Tracker.jsx         # Lógica del Cronómetro y Control de Tiempo
│   └── History.jsx         # Vista del Historial de Jornadas
├── config/
│   └── supabaseClient.js   # Cliente de conexión a Supabase
├── App.jsx                 # Componente Raíz y Rutas
└── main.jsx                # Punto de Entrada de React

.agent/
├── rules/
│   └── buenaspracticas.md  # Directivas siempre activas para el agente
└── skills/
    ├── rpsoft-ui/
    │   └── SKILL.md        # Skill de diseño y maquetación
    └── rpsoft-supabase/
        └── SKILL.md        # Skill de integración con Supabase

docs/
└── db-standards.md         # Estándares de base de datos del proyecto
```

---

## 🤖 Cómo usar las Skills

Las **skills** son instrucciones especializadas que el agente de IA **Antigravity** lee automáticamente antes de ejecutar cualquier tarea relacionada. Garantizan que todo el código generado siga los estándares del proyecto sin que tengas que repetirlos en cada petición.

### Skills disponibles

#### 🎨 RPSoft UI

**Ubicación:** `.agent/skills/rpsoft-ui/SKILL.md`

Define los estándares de diseño y maquetación del proyecto:

| Área          | Qué define                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Stack         | React 18 + Vite + CSS vanilla (sin librerías externas)                     |
| Layout        | Sidebar 240 px fijo + `main-content` flexible; drawer off-canvas en mobile |
| Componentes   | PascalCase, clases CSS en kebab-case con prefijo de componente             |
| Paleta        | 16 tokens CSS (`--bg-dark`, `--accent-primary`, `--text-primary`, etc.)    |
| Accesibilidad | Contraste WCAG AA, `focus-visible`, navegación por teclado                 |
| DoD UI        | Sin errores en consola · Responsive mobile/desktop · PascalCase            |

**Cuándo se activa:** en cualquier tarea que involucre crear o modificar componentes, estilos CSS, layout o colores.

---

#### 🗄️ RPSoft Supabase

**Ubicación:** `.agent/skills/rpsoft-supabase/SKILL.md`

Define los estándares de integración con la base de datos:

| Área      | Qué define                                                                   |
| --------- | ---------------------------------------------------------------------------- |
| Naming    | Tablas en `snake_case` plural inglés · Columnas · Tipos preferidos           |
| RLS       | Políticas base SELECT / INSERT / UPDATE por `auth.uid() = user_id`           |
| Seguridad | `.env` en `.gitignore` · Solo `anon key` al frontend · Rotación de claves    |
| Esquema   | Columnas obligatorias (`id`, `user_id`, `created_at`) · Trigger `updated_at` |

**Cuándo se activa:** en cualquier tarea que involucre tablas, columnas, consultas a Supabase, variables de entorno o políticas RLS.

---

### ¿Cómo las activa Antigravity?

1. **Detección automática:** cuando recibes una tarea, Antigravity evalúa el contexto y determina qué skills son relevantes.
2. **Lectura del skill:** antes de escribir ningún código, lee el archivo `SKILL.md` correspondiente con la herramienta `view_file`.
3. **Aplicación:** todo el código generado cumple las convenciones del skill — naming, variables CSS, RLS, try/catch, etc.
4. **Sin configuración extra:** no necesitas mencionar las skills en cada petición; el agente las consulta por sí solo siempre que sean aplicables.

> Si el agente lista los skills antes de actuar (como cuando le preguntas explícitamente), confirmará cuál usará y por qué.
