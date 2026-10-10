# Tasks

> Sin tests por decisión explícita del change: la verificación de cada tarea es un comando de compilación o lint, o un comportamiento observable en la API o en la pantalla.

## 1. Modelo de datos y regla

- [ ] 1.1 Crear la migración que añade `due_date` nullable a `tasks` y ejecutar `node ace migration:run`; verificar que `database/schema.ts` se regenera con la columna sin editarlo a mano, que las tareas existentes siguen válidas y que no hay columna para `isOverdue`
- [ ] 1.2 Añadir al modelo `Task` el método de vencimiento (fecha presente, anterior al día de referencia y estado distinto de `done`) y verificar `npm run typecheck` en `backend/`

## 2. API

- [ ] 2.1 Añadir el helper del día de referencia (`X-Client-Date` válida o fecha del servidor) y ampliar `TaskTransformer` con `dueDate` e `isOverdue` recibiendo el día; verificar `npm run typecheck`
- [ ] 2.2 Ampliar los validadores de creación y actualización con `dueDate` opcional y nulable (sin `isOverdue`) y el controlador con la acción `show`; registrar `GET /api/v1/tasks/:id`; verificar con `node ace list:routes` que existen `GET`, `GET /:id`, `POST` y `PATCH /:id` y ninguna de borrado
- [ ] 2.3 Verificar con `curl` y un token: crear sin fecha, poner, cambiar y quitar la fecha (`null` y `""`), fecha pasada aceptada, 422 con `2026-02-30`, fecha de hoy no vencida y de ayer vencida con distinta `X-Client-Date`, `done` no vencida y con la fecha intacta, `isOverdue` enviado ignorado, reasignar sin tocar la fecha, `GET /:id` 200 y 404, `DELETE` 404 y 401 sin token
- [ ] 2.4 Verificar `npm run lint` y `npm run typecheck`, y commitear el diff regenerado de `.adonisjs/`

## 3. Interfaz

- [ ] 3.1 Añadir `dueDate` e `isOverdue` al tipo `Task`, `getTask`, la cabecera `X-Client-Date` y `dueDate` en la actualización, más la etiqueta «la fecha de vencimiento» en la traducción de errores de `lib/api.ts`; verificar `npm run build` en `frontend/`
- [ ] 3.2 Crear la página `/tasks/:id` con el campo de fecha, la acción de quitarla sin confirmación, el mensaje de error bajo el campo y la señal «Vencida» con texto; registrarla bajo `ProtectedRoute`; verificar `npm run build` y `npm run lint`
- [ ] 3.3 Convertir el título de cada fila de la lista en enlace a `/tasks/:id` sin mostrar fecha ni marca; verificar que el resto de la fila no cambia y que `npm run build` pasa

## 4. Cierre

- [ ] 4.1 Recorrer en el navegador los scenarios de la spec delta (poner, cambiar y quitar fecha, vencida con fecha pasada, hoy no vencida, hecha no vencida, lista sin fechas ni marcas) y ejecutar `npm run lint` y `npm run build` sin errores
