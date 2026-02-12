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
│   ├── Login.jsx       # Interfaz de Inicio de Sesión
│   ├── Signup.jsx      # Interfaz de Registro de Usuario
│   ├── Dashboard.jsx   # Panel Principal y Navegación
│   ├── Tracker.jsx     # Lógica del Cronómetro y Control de Tiempo
│   └── History.jsx     # Vista del Historial de Jornadas
├── config/
│   └── supabaseClient.js # Cliente de conexión a Supabase
├── App.jsx             # Componente Raíz y Rutas
└── main.jsx            # Punto de Entrada de React
```
