# Estándares de Base de Datos — Control Horario

> **Proyecto:** RPSoft Control Horario  
> **Base de datos:** Supabase (PostgreSQL 17)  
> **Última actualización:** 2026-02-20

---

## 1. Convenciones de Naming

### Tablas

| Regla                           | Correcto        | Incorrecto                |
| ------------------------------- | --------------- | ------------------------- |
| `snake_case`, plural, en inglés | `work_sessions` | `WorkSession`, `jornadas` |
| Sin prefijos innecesarios       | `users`         | `tbl_users`               |

### Columnas

| Regla                            | Correcto                            | Incorrecto            |
| -------------------------------- | ----------------------------------- | --------------------- |
| `snake_case`                     | `start_time`, `user_id`             | `startTime`, `UserId` |
| Clave primaria siempre `id uuid` | `id uuid DEFAULT gen_random_uuid()` | `session_id`, `ID`    |
| FK: `<tabla_singular>_id`        | `user_id`                           | `userId`, `fk_user`   |
| Timestamps obligatorios          | `created_at` / `updated_at`         | —                     |

### Tipos preferidos

| Dato                 | Tipo PostgreSQL                  |
| -------------------- | -------------------------------- |
| Identificador        | `uuid DEFAULT gen_random_uuid()` |
| Marca de tiempo      | `timestamptz` (con zona horaria) |
| Duración en segundos | `integer`                        |
| Estado / categoría   | `text` con `CHECK` constraint    |
| Booleano             | `boolean DEFAULT false`          |

---

## 2. Estructura de la tabla `work_sessions`

Tabla principal del sistema. Registra cada jornada laboral de un usuario.

```sql
CREATE TABLE public.work_sessions (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      text        NOT NULL,          -- ver valores válidos abajo
  start_time  timestamptz,                   -- inicio de la jornada / reanudación
  end_time    timestamptz,                   -- fin de la jornada
  pause_time  timestamptz,                   -- momento en que se pausó
  duration    integer,                       -- segundos totales trabajados
  created_at  timestamptz DEFAULT now()
);
```

### Valores válidos para `status`

| Valor       | Significado                                        |
| ----------- | -------------------------------------------------- |
| `active`    | Sesión en curso                                    |
| `paused`    | Sesión pausada temporalmente                       |
| `completed` | Sesión finalizada; `duration` y `end_time` fijados |

> **Nota:** Cuando se reanuda una sesión, `start_time` se actualiza al momento actual y `pause_time` se pone a `null`. La duración acumulada se mantiene en `duration` antes de la pausa.

---

## 3. Políticas RLS activas

Row Level Security está habilitado en `work_sessions`. Las tres políticas en producción son:

```sql
-- Lectura: cada usuario ve solo sus propias sesiones
CREATE POLICY "users can view own sessions"
ON public.work_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Inserción: solo se puede insertar con el user_id del usuario autenticado
CREATE POLICY "users can insert own sessions"
ON public.work_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Actualización: solo se pueden modificar las sesiones propias
CREATE POLICY "users can update own sessions"
ON public.work_sessions FOR UPDATE
USING  (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

> No existe política de DELETE porque el producto no permite borrar sesiones desde el cliente.

Para verificar las políticas activas en cualquier momento:

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'work_sessions';
```

---

## 4. Checklist de seguridad

### Variables de entorno

- [ ] `.env` está en `.gitignore` y **nunca** se sube al repositorio.
- [ ] El repo incluye `.env.example` con los nombres de variables pero sin valores.
- [ ] Variables del proyecto:
  ```
  VITE_SUPABASE_URL=https://<ref>.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon-key>
  ```

### Claves API

- [ ] Solo la **anon key** se expone al frontend (prefijo `VITE_`).
- [ ] La **service_role key** se usa exclusivamente en Edge Functions o servidor, nunca en el cliente.
- [ ] Si una clave se expone accidentalmente → rotarla de inmediato en **Supabase → Settings → API**.
- [ ] Las claves no aparecen en logs, comentarios ni mensajes de error devueltos al cliente.

### RLS

- [ ] Toda tabla nueva tiene `ALTER TABLE … ENABLE ROW LEVEL SECURITY` antes de hacer deploy.
- [ ] Ninguna tabla se queda con RLS habilitado sin políticas (eso bloquea todo acceso).
- [ ] Tras cada migración DDL, ejecutar los advisors de seguridad de Supabase para detectar tablas expuestas.

---

## 5. Buenas prácticas para futuras tablas

### Plantilla SQL base

```sql
-- 1. Crear la tabla
CREATE TABLE public.<nombre_plural> (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- ... columnas del dominio ...
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS inmediatamente
ALTER TABLE public.<nombre_plural> ENABLE ROW LEVEL SECURITY;

-- 3. Políticas mínimas
CREATE POLICY "users can view own <nombre>"
ON public.<nombre_plural> FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users can insert own <nombre>"
ON public.<nombre_plural> FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own <nombre>"
ON public.<nombre_plural> FOR UPDATE
USING  (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Trigger para updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_<nombre>_updated_at
BEFORE UPDATE ON public.<nombre_plural>
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Reglas adicionales

- **Nunca hagas queries sin `WHERE user_id = auth.uid()`** en el frontend, aunque RLS ya lo filtre. Es defensa en profundidad.
- **Toda llamada a Supabase va dentro de `try/catch`** con mensaje de error claro para el usuario.
- **No uses `select('*')` en producción** para tablas con muchas columnas; selecciona solo las necesarias.
- **Índices**: crea siempre un índice en `user_id` si la tabla va a tener muchas filas por usuario:
  ```sql
  CREATE INDEX idx_<nombre>_user_id ON public.<nombre_plural>(user_id);
  ```
- **Migraciones**: todo cambio de esquema debe escribirse como migración versionada, nunca editando tablas directamente en el panel de Supabase en producción.
