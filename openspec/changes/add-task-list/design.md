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

4. **Validación.** Crear: `title` obligatorio con `trim()` y longitud mínima 1, sin máximo (punto abierto). El validador no declara `status` ni `assigneeId`, así que lo que llegue de más se descarta. Actualizar: `status` opcional con enum, `assigneeId` opcional que debe existir en `users`, y al menos uno presente; `title` no está en el validador. Tarea inexistente: `findOrFail` → 404. Al guardar el título se normaliza sin espacios sobrantes. Comprobar al implementar que `trim()` se aplica antes de la comprobación de mínimo con espacios solos.

5. **Sin ordenación.** La consulta de la lista no declara `orderBy`. El orden resultante no es un contrato (punto abierto PA-3) y ninguna parte del frontend reordena.

6. **Frontend.** Funciones `getTasks`, `createTask` y `updateTask` en `lib/api.ts` (el tipo de método admite `PATCH`) y tipos espejo en `lib/types.ts`. Página `tasks-page.tsx` bajo `ProtectedRoute` en `/tasks`, con `Card`, `Button`, `Input`, `Label` y `Alert` existentes. El estado se cambia con tres `Button` por fila, el activo con variante distinta; no hay componente Select ni se añade. Etiquetas Pendiente / En curso / Hecho en un único mapa de presentación; los identificadores de la API nunca se pintan.

7. **Cambio de estado optimista.** La fila cambia al pulsar; si la petición falla, se restaura el estado previo y se muestra un `Alert`. Creación: se añade la fila devuelta por la API al final del estado local, sin recargar.

8. **Errores.** Se amplía la traducción de `lib/api.ts` con la etiqueta «el título» para los 422 de creación; un título vacío o en blanco se avisa también en cliente junto al campo antes de enviar.

9. **Estado vacío.** Cuando la lista llega vacía se muestra un texto explicativo y un botón que lleva el foco al campo de título.

## Risks / Trade-offs

- [Orden no definido: la lista puede cambiar de aspecto entre cargas] → anotado como punto abierto; no se inventa criterio.
- [Cualquier cambio es posible, incluso volver desde Hecho y marcar hecho por error] → es el comportamiento acordado por ahora (PA-7); la reversibilidad es inmediata.
- [Dos personas cambian la misma tarea a la vez: gana el último] → sin aviso de conflicto (PA-8).
- [Sin título máximo, un título enorme rompe el diseño de la fila] → mitigar con truncado visual solo por CSS, sin recortar el dato.
- [Sin pruebas por decisión explícita] → la verificación del change se limita a typecheck, lint, build y comprobación manual de los scenarios.
