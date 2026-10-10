# Proposal

## Why

Una tarea sin plazo no avisa de que se ha pasado de plazo. La historia FS-118 pide poder poner, cambiar o quitar una fecha de vencimiento y saber, sin comparar fechas a ojo, si una tarea está vencida. Hoy la tarea no tiene fecha, y la lista debe seguir mostrando solo título, responsable y estado.

## What Changes

- **Fecha de vencimiento**: la tarea gana una fecha de calendario opcional (sin hora). Se puede poner, cambiar y quitar; quitarla se hace enviándola explícitamente vacía. Se acepta una fecha anterior a hoy, al crear y al actualizar.
- **Vencida (`isOverdue`)**: campo booleano que la API incluye en la representación de una tarea. Es verdad solo si la tarea tiene fecha, la fecha es anterior al día de referencia y su estado no es `done`. Lo calcula el backend en cada lectura; no se persiste y, si el cliente lo envía, se ignora. Una tarea cuya fecha es hoy no está vencida.
- **Día de referencia**: el cliente envía su día de calendario en la cabecera `X-Client-Date` (`YYYY-MM-DD`); el servidor devuelve el veredicto. Sin cabecera, usa su propia fecha.
- **Lectura individual**: nueva operación `GET /api/v1/tasks/{id}`, la superficie mínima que la historia necesita para «abrir la tarea». Sustituye la restricción anterior de «solo tres operaciones» por cuatro.
- **Interfaz**: la lista no cambia lo que muestra (título, responsable y estado); el título pasa a ser un enlace. Una página mínima `/tasks/:id` permite poner, cambiar y quitar la fecha y muestra una señal propia de vencida.
- **Fuera de este change**: tests, notificaciones, recordatorios, recurrencia, ordenar o filtrar por fecha, la pantalla de detalle completa (PA-6) y cualquier fecha o marca en la lista.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `tasks`: la representación de una tarea gana fecha de vencimiento y `isOverdue`; se añaden la lectura individual y la edición de la fecha; la lista deja de afirmar que la API no incluye fechas, aunque la pantalla de la lista sigue sin mostrarlas.

## Impact

- **Backend**: migración con columna de fecha nullable (regenera `database/schema.ts`), regla de vencimiento en el modelo, validadores, transformer con el día de referencia, ruta y acción de lectura individual; el registro generado de `.adonisjs/` cambia.
- **Frontend**: tipos y llamadas en `lib/api.ts` (cabecera del día y lectura individual), página `/tasks/:id`, título de la fila como enlace. Sin dependencias nuevas.
- **API existente**: cambio compatible; solo se añaden campos y una operación.

## Puntos abiertos

- **Pantalla de detalle completa (PA-6).** Este change solo añade la lectura individual y una página mínima; la forma final de esa lectura puede cambiar cuando se defina el detalle.
- **Cabecera de día inválida.** Qué ocurre con un `X-Client-Date` que no es una fecha de calendario válida no está decidido; el diseño la trata como ausente.
- **Huso del servidor.** El día de respaldo es el del servidor y puede no coincidir con el de quien mira.
- **Volver desde Hecho (PA-7) y choque de ediciones (PA-8).** Sin decidir; la fecha no se toca al cambiar de estado ni de responsable.
