---
name: RPSoft Supabase
description: >
  Skill de integración con Supabase para el sistema de control horario RPSoft.
  Define convenciones de nombres de tablas y columnas, políticas RLS base para
  lectura/escritura por usuario, checklist de seguridad para variables de
  entorno y claves API, y el esquema SQL real de la tabla work_sessions.
---

# RPSoft Supabase Skill

## Convenciones de nombres

### Tablas

| Regla                     | Ejemplo correcto | Ejemplo incorrecto           |
| ------------------------- | ---------------- | ---------------------------- |
| `snake_case`, plural      | `work_sessions`  | `WorkSession`, `workSession` |
| Nombres en inglés         | `work_sessions`  | `jornadas`                   |
| Sin prefijos innecesarios | `users`          | `tbl_users`                  |

### Columnas

| Regla                                      | Ejemplo correcto                    | Ejemplo incorrecto       |
| ------------------------------------------ | ----------------------------------- | ------------------------ |
| `snake_case`                               | `start_time`                        | `startTime`, `StartTime` |
| Clave primaria siempre `id` de tipo `uuid` | `id uuid DEFAULT gen_random_uuid()` | `session_id`, `ID`       |
| FK nombrada `<tabla_singular>_id`          | `user_id`                           | `userId`, `fk_user`      |
| Timestamps obligatorios en toda tabla      | `created_at`, `updated_at`          | —                        |

### Timestamps obligatorios

Toda tabla **debe** incluir al menos `created_at`. Si los registros se modifican, también `updated_at`:

```sql
created_at  timestamptz DEFAULT now(),
updated_at  timestamptz DEFAULT now()
```

Para actualizar `updated_at` automáticamente, usar el trigger estándar del proyecto:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON <tabla>
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## Políticas RLS base (por usuario)

Habilitar RLS **siempre** antes de definir políticas:

```sql
ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;
```

### Lectura — solo filas propias

```sql
CREATE POLICY "users can view own rows"
ON <tabla>
FOR SELECT
USING (auth.uid() = user_id);
```

### Inserción — solo con user_id del usuario autenticado

```sql
CREATE POLICY "users can insert own rows"
ON <tabla>
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Actualización — solo filas propias

```sql
CREATE POLICY "users can update own rows"
ON <tabla>
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Eliminación — solo filas propias (añadir si se necesita)

```sql
CREATE POLICY "users can delete own rows"
ON <tabla>
FOR DELETE
USING (auth.uid() = user_id);
```

> **Regla:** Nunca dejar una tabla con RLS habilitado **sin** políticas definidas; eso bloquea todo acceso.

---

## Checklist de seguridad

### Variables de entorno

- [ ] El archivo `.env` está en `.gitignore` y **nunca** se sube al repositorio.
- [ ] Las variables usan el prefijo `VITE_` solo para las que el navegador necesita; el resto se mantiene en el servidor.
- [ ] Nombre estándar de variables del proyecto:

  ```
  VITE_SUPABASE_URL=https://<ref>.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon-key>
  ```

- [ ] El archivo `.env.example` existe en el repo con los nombres de variables pero **sin valores reales**.

### Claves API

- [ ] Solo se expone al frontend la **anon key** (clave pública); la **service_role key** queda exclusivamente en el servidor o Edge Functions.
- [ ] Las Edge Functions usan `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`, nunca variables inyectadas por Vite.
- [ ] Si una clave se expone accidentalmente, rotarla de inmediato en el panel de Supabase (Settings → API).
- [ ] No incluir claves en comentarios, logs ni mensajes de error devueltos al cliente.

### RLS

- [ ] Toda tabla nueva tiene RLS habilitado antes de hacer deploy.
- [ ] Verificar políticas con `SELECT * FROM pg_policies WHERE tablename = '<tabla>';`.
- [ ] Ejecutar `get_advisors` (security) de Supabase MCP tras cada migración DDL.

---

## Esquema SQL — `work_sessions` (tabla real del proyecto)

```sql
-- Tabla principal de sesiones de trabajo
CREATE TABLE public.work_sessions (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      text        NOT NULL,                  -- 'active' | 'paused' | 'finished'
  start_time  timestamptz,
  end_time    timestamptz,
  pause_time  timestamptz,
  duration    integer,                               -- segundos totales trabajados
  created_at  timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas activas en producción
CREATE POLICY "users can view own sessions"
ON public.work_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users can insert own sessions"
ON public.work_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own sessions"
ON public.work_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Valores válidos para `status`

| Valor      | Significado                          |
| ---------- | ------------------------------------ |
| `active`   | Sesión en curso                      |
| `paused`   | Sesión pausada temporalmente         |
| `finished` | Sesión finalizada, `duration` fijado |

> `duration` se calcula en el cliente (segundos) y se persiste al terminar la sesión con `end_time`.
