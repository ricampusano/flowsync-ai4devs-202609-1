# Design

## Context

El backend sigue las convenciones de `CLAUDE.md`: esquema generado desde migraciones, controladores registrados vía `#generated/controllers`, respuestas por `serialize()` con transformers, validadores VineJS con `vine.create`, y protección con `middleware.auth()` sobre el grupo de rutas (guard `api`, tokens opacos). El frontend centraliza el acceso a la API en `lib/api.ts` y protege rutas con `ProtectedRoute`. Ver `proposal.md` para el motivo y el alcance; los requisitos están en `specs/tasks/spec.md`.

## Goals / Non-Goals

**Goals:**
- Una tabla, un modelo, tres rutas y una página, siguiendo los patrones existentes.
- Exponer del responsable solo lo que la lista necesita.

**Non-Goals:**
- Tests, base de pruebas, ordenación, paginación, fechas, filtros, refresco automático, endpoints de equipo o de usuarios.

## Decisions

1. **Rutas.** Un grupo `/api/v1/tasks` con `.use(middleware.auth())`: `GET /` (listar), `POST /` (crear), `PATCH /:id` (actualizar). No se registran `show` ni `destroy`, de modo que esas peticiones dan 404 sin código extra. *Alternativa descartada:* un recurso completo con `router.resource` y filtrar acciones; es más fácil dejarlo expuesto por error.

2. **Datos.** Migración `tasks` con `id`, `title` (string), `status` (string, por defecto `pending`), `assignee_id` (FK a `users`, no nulo) y marcas de tiempo. Sin columna de vencimiento ni «dejarla preparada». El estado se guarda como cadena y se valida en la API con un enum cerrado de VineJS; *alternativa descartada:* enum de base de datos, que en SQLite se emula con CHECK y complica migrar.

3. **Responsable.** Relación `belongsTo` con `User` precargada en la lista. El transformer de tarea expone `{ id, title, status, assignee: { id, fullName } }` y deja fuera correo, iniciales y marcas del usuario. El `id` viaja en la API porque la actualización recibe `assigneeId`; la interfaz no lo pinta nunca y muestra `fullName ?? 'Sin nombre'`. *Riesgo aceptado:* el cliente conoce ids de usuarios que aparecen en la lista; no hay endpoint de usuarios, así que cambiar a una persona sin tarea solo es posible conociendo su id.

4. **Validación.** Crear: `title` obligatorio: se rechaza ausente, vacío o formado solo por espacios (comprobando el valor sin alterar el que se guarda), sin máximo (punto abierto). Qué ocurre con campos extra en la petición no está decidido y el diseño no lo fija. Actualizar: `status` y `assigneeId` aceptados; `status` con enum cerrado y `assigneeId` que debe existir en `users`. Tarea inexistente → 404. El diseño no fija la precedencia entre errores concurrentes ni qué pasa con una actualización sin datos. La constante de estados se define una vez en el backend y se espeja en `lib/types.ts`.

5. **Sin ordenación.** La consulta de la lista no declara `orderBy`. El orden resultante no es un contrato (punto abierto PA-3) y ninguna parte del frontend reordena.

6. **Frontend.** Funciones `getTasks`, `createTask` y `updateTask` en `lib/api.ts` (el tipo de método admite `PATCH`) y tipos espejo en `lib/types.ts`. Página `tasks-page.tsx` bajo `ProtectedRoute` en `/tasks`, con `Card`, `Button`, `Input`, `Label` y `Alert` existentes. El estado se cambia con tres `Button` por fila, el activo con variante distinta; no hay componente Select ni se añade. Etiquetas Pendiente / En curso / Hecho en un único mapa de presentación; los identificadores de la API nunca se pintan.

7. **Refresco local.** El cambio de estado se refleja en la fila de inmediato y la creación añade la fila devuelta por la API a la lista local, sin recargar. Qué hacer ante un fallo de la petición, ante peticiones simultáneas o ante una sesión perdida a mitad de operación no está decidido y queda fuera del contrato; la implementación usará el tratamiento de errores ya existente en `lib/api.ts` sin añadir reglas nuevas.

8. **Título vacío.** Se amplía la traducción de `lib/api.ts` con la etiqueta «el título» para que el rechazo de un título ausente, vacío o en blanco se explique junto al campo en lenguaje corriente (E2-2 CA-1 y CA-2).

9. **Estado vacío.** Cuando la lista llega vacía se muestra un texto explicativo y un botón que lleva el foco al campo de título.

## Risks / Trade-offs

- [Orden no definido: la lista puede cambiar de aspecto entre cargas] → anotado como punto abierto; no se inventa criterio.
- [Transiciones de estado y choque de ediciones sin decidir (PA-7, PA-8)] → anotado como punto abierto; este change no añade reglas.
- [Reasignar (`assigneeId`) excede E2-1…E2-4 pero está pedido por la restricción «cualquiera cambia estado y responsable»; la interfaz no lo expone y el 422 de responsable inexistente permite sondear ids] → aceptado: no hay endpoint de usuarios y el id no es secreto en un equipo cerrado.
- [Sin título máximo, un título enorme puede afectar al aspecto de la fila] → anotado como punto abierto (PA-9).
- [Sin pruebas por decisión explícita] → la verificación del change se limita a typecheck, lint, build y comprobación manual de los scenarios.
