# Debug Log — Sprint 1

> **Proyecto:** RPSoft Control Horario  
> **Fecha:** 2026-02-20  
> **Rama:** `feature/evidence-debug`

---

## BUG-01 — `formatDurationDisplay` ignoraba los segundos

### Descripción del problema

En la vista **Historial de Jornadas**, la duración de cada sesión se mostraba de forma incompleta. Una sesión de, por ejemplo, 1 hora 23 minutos y 45 segundos se renderizaba como `"1h 23m"`, descartando silenciosamente los 45 segundos. Para sesiones cortas de menos de un minuto, el valor mostrado era `"0m"`, lo que resultaba confuso e informalmente incorrecto.

Adicionalmente, las sesiones activas o pausadas (sin `duration` persistida) mostraban `"En curso"` como texto plano, sin distinción visual respecto a los valores numéricos.

### Causa raíz

La función `formatDurationDisplay` calculaba solo horas y minutos:

```js
// ANTES — History.jsx
const formatDurationDisplay = (totalSeconds) => {
  if (!totalSeconds && totalSeconds !== 0) return "En curso";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  // ❌ seconds nunca se calculan ni se muestran
  if (hours > 0) return `${hours}h ${minutes}m`;
  else return `${minutes}m`;
};
```

Además, la condición `!totalSeconds` es truthy cuando `totalSeconds === 0`, por lo que una sesión de 0 segundos devolvía `"En curso"` en lugar de `"0s"`.

### Solución aplicada

Se reemplazó `formatDurationDisplay` por `parseDuration`, que descompone el total de segundos en `{ hours, minutes, seconds }` y devuelve `null` explícitamente para sesiones sin duración persistida:

```js
// DESPUÉS — History.jsx
const parseDuration = (totalSeconds, status) => {
  if (
    (totalSeconds === null || totalSeconds === undefined) &&
    status !== "completed"
  ) {
    return null; // sesión todavía en curso o pausada por primera vez
  }
  const secs = totalSeconds ?? 0;
  return {
    hours: Math.floor(secs / 3600),
    minutes: Math.floor((secs % 3600) / 60),
    seconds: secs % 60,
  };
};
```

El JSX renderiza cada unidad solo si es significativa (horas aparecen si `> 0`, minutos aparecen si hay horas o minutos), y los segundos siempre se muestran. Las sesiones activas reciben la clase CSS `.history-duration--live` con color diferenciado.

**Resultado:** `"1h 23m 45s"` · `"34s"` · badge verde `"En curso"`.

### Archivos modificados

| Archivo                      | Cambio                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/components/History.jsx` | Reemplazada `formatDurationDisplay` por `parseDuration`; JSX actualizado para renderizar unidades separadas con `<span>` |
| `src/components/History.css` | Añadidas clases `.history-duration`, `.dur-num`, `.dur-unit`, `.history-duration--live`                                  |

---

## BUG-02 — `handleResume` persistía `pause_time` incorrecto al reanudar

### Descripción del problema

Al reanudar una jornada pausada, el cronómetro arrancaba correctamente en el cliente, pero en la base de datos el campo `pause_time` conservaba el timestamp del momento de la pausa anterior. En una pausa posterior, el registro resultaba ambiguo: no era posible distinguir si `pause_time` correspondía a la pausa activa o a una pausa ya superada.

Esto también afectaba la recarga del componente: `checkActiveSession` calculaba el tiempo transcurrido desde `start_time`, pero si `pause_time` seguía presente con un valor obsoleto, cualquier lógica futura que leyera ese campo obtendría datos incorrectos.

### Causa raíz

La función `handleResume` enviaba a Supabase el nuevo `start_time` y el nuevo `status`, pero **no limpiaba `pause_time`**, dejándolo con el valor de la pausa anterior:

```js
// ANTES — comportamiento implícito (campo no incluido en el UPDATE)
await supabase
  .from("work_sessions")
  .update({
    status: "active",
    start_time: new Date().toISOString(),
    // ❌ pause_time no se toca → queda con el timestamp de la pausa anterior
  })
  .eq("id", activeSession.id);
```

### Solución aplicada

Se añadió `pause_time: null` explícitamente en el payload del `UPDATE`, garantizando que al reanudar la sesión el campo quede limpio:

```js
// DESPUÉS — Tracker.jsx (handleResume, líneas 145-154)
await supabase
  .from("work_sessions")
  .update({
    status: "active",
    start_time: new Date().toISOString(),
    pause_time: null, // ✅ limpia el timestamp de pausa anterior
  })
  .eq("id", activeSession.id)
  .select()
  .single();
```

La duración acumulada antes de la pausa se mantiene en el estado local de React (`duration`) y no se persiste hasta la siguiente pausa o finalización, lo que es el comportamiento correcto.

### Archivos modificados

| Archivo                      | Cambio                                                     |
| ---------------------------- | ---------------------------------------------------------- |
| `src/components/Tracker.jsx` | Añadido `pause_time: null` en el payload de `handleResume` |
