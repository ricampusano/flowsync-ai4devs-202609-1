# Design

## Context

El change `add-task-list` dejó la capability `tasks` con tres operaciones, una representación `{ id, title, status, assignee }` y una lista que no muestra fechas. El backend usa esquema generado, transformers y validadores VineJS; el frontend centraliza la API en `lib/api.ts` y protege rutas con `ProtectedRoute`. Ver `proposal.md` para el motivo; los requisitos están en `specs/tasks/spec.md`.

## Goals / Non-Goals

**Goals:**
- Un único lugar con la regla de vencimiento, evaluado al leer, con el día de quien mira.
- Superficie mínima: una columna, una operación de lectura, una página.

**Non-Goals:**
- Tests, jobs nocturnos, columnas derivadas, notificaciones, orden o filtro por fecha, detalle completo, fecha o marca en la lista.

## Decisions

1. **Dato.** Migración que añade `due_date` nullable de tipo fecha a `tasks`. Las tareas existentes quedan sin fecha. `isOverdue` no tiene columna. El tipo generado por el esquema (fecha sin hora) se comprueba al regenerar `database/schema.ts`; si hace falta, una regla en `schema_rules.ts`, nunca edición a mano.

2. **La regla vive en el modelo.** Un método del modelo `Task` recibe el día de referencia (`YYYY-MM-DD`) y devuelve verdadero solo con fecha, fecha estrictamente anterior y estado distinto de `done`. Comparar cadenas ISO de fecha evita cualquier cálculo con husos u horas. Ninguna otra capa reimplementa la regla. *Alternativa descartada:* calcularla en el frontend; contradice la restricción 2.

3. **Día de referencia.** Un pequeño helper del backend lee `X-Client-Date`; si es una fecha de calendario válida la usa y, si falta o no lo es, usa la fecha local del servidor. El controlador lo calcula una vez por petición y se lo pasa al transformer como segundo argumento (`TaskTransformer.transform(task, today)`, que `BaseTransformer` admite como parámetros extra del constructor). *Alternativa descartada:* parámetro en query o cuerpo, que repetiría el mecanismo en cada operación. La cabecera `X-Client-Date` ya la admite CORS (`headers: true`).

4. **Representación única.** El mismo transformer sirve lista, lectura, creación y actualización, por lo que todas incluyen `dueDate` (`YYYY-MM-DD` o `null`) e `isOverdue`. La lista de la API las lleva; la pantalla de la lista las ignora (restricción 6).

5. **Entrada.** El validador de creación acepta `dueDate` opcional y nulable; el de actualización añade `dueDate` opcional y nulable junto a `status` y `assigneeId`. Una cadena vacía llega como `null` por la configuración del bodyparser, así que «quitar» es enviarla vacía o `null`; omitirla la deja como está. Una fecha que no existe o está incompleta responde 422 sobre `dueDate`. `isOverdue` no figura en ningún validador, así que no se lee. No hay regla de «no anterior a hoy» (restricción 4).

6. **Lectura individual.** Acción `show` con `GET /api/v1/tasks/:id`, `findOrFail` y la misma representación. Se añade en el grupo de rutas existente. El resto del grupo no cambia; no se añade borrado.

7. **Frontend.** `lib/api.ts` añade `getTask`, y una cabecera `X-Client-Date` con el día local del navegador (`YYYY-MM-DD` según su calendario) en todas las llamadas de tareas; la actualización admite `dueDate`. La página `task-page.tsx` en `/tasks/:id` bajo `ProtectedRoute` usa `Card`, `Input` (`type="date"`), `Button` y `Alert` existentes; el campo nativo evita traer un componente de fecha, que no existe en el proyecto. Guardado sin botón: se envía al cambiar a una fecha completa y válida; la acción «Quitar fecha» envía `null` sin confirmación; un valor incompleto no se envía. Un 422 muestra su mensaje bajo el campo con el mecanismo de errores por campo existente (etiqueta «la fecha de vencimiento») y la página sigue mostrando la fecha guardada. La señal «Vencida» es una `Alert` con icono y texto.

8. **Lista.** Solo cambia que el título pasa a ser un `Link` a `/tasks/:id`; no se lee ni se pinta `dueDate` ni `isOverdue`.

## Risks / Trade-offs

- [Un cliente sin cabecera o con otra zona recibe veredictos relativos al día del servidor] → aceptado; anotado como punto abierto.
- [Cabecera inválida tratada como ausente en lugar de rechazada] → decisión mínima, anotada como punto abierto.
- [La lectura individual puede cambiar cuando se defina el detalle completo (PA-6)] → superficie mínima y anotada.
- [La lista de la API lleva campos que su pantalla no usa] → deliberado: una sola representación.
- [Sin pruebas por decisión explícita] → verificación limitada a typecheck, lint, build, `curl` y comprobación manual.
