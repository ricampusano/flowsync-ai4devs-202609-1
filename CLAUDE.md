# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

FlowSync: proyecto de práctica de un curso (gestión de tareas en equipo). Repo dividido en dos apps independientes que no comparten `package.json` ni node_modules:

- `backend/` — API en AdonisJS 7, SQLite (`better-sqlite3`), autenticación por access tokens.
- `frontend/` — React 19 + Vite, scaffold por ahora sin lógica de negocio (el ticket de referencia del curso es "Implementar login en el frontend").

Esta rama (`s1/start`) es el punto de partida del ejercicio del Módulo 1: no asumas que el login u otras features existen todavía en el frontend.

## Comandos

### Backend (`cd backend`)

```bash
npm install
cp .env.example .env
node ace generate:key      # rellena APP_KEY en .env, solo la primera vez
node ace migration:run     # aplica las migraciones a SQLite (backend/tmp/db.sqlite3)
npm run dev                # node ace serve --hmr, arranca en http://localhost:3333
npm run build               # node ace build
npm run test                # node ace test (suites unit + functional, ver adonisrc.ts)
npm run lint                # eslint .
npm run format               # prettier --write .
npm run typecheck            # tsc --noEmit
```

Para correr un único test, usa los filtros de Japa directamente, p. ej.:
```bash
node ace test --files "tests/functional/auth.spec.ts"
```

### Frontend (`cd frontend`)

```bash
npm install
npm run dev        # vite, arranca en http://localhost:5173
npm run build       # tsc -b && vite build
npm run lint         # oxlint
npm run preview       # vite preview
```

El backend y el frontend se corren en terminales separadas (el backend debe seguir corriendo mientras se usa el frontend). CORS ya permite cualquier origen en desarrollo (`config/cors.ts`), así que no hace falta configurar nada para que `localhost:5173` hable con `localhost:3333`.

No hay un test runner configurado en el frontend todavía.

## Arquitectura del backend

Convención de imports: AdonisJS usa **subpath imports** definidos en `backend/package.json` (`imports`), no rutas relativas. Por ejemplo, desde cualquier archivo: `import User from '#models/user'`, `import { loginValidator } from '#validators/user'`. Los prefijos (`#controllers`, `#models`, `#validators`, `#transformers`, `#middleware`, `#services`, `#listeners`, `#events`, `#policies`, `#abilities`, `#database`, `#tests`, `#start`, `#config`, `#providers`) mapean a `app/*`, `database/*`, etc. Respeta este patrón al crear archivos nuevos: no funcionará con imports relativos entre carpetas de nivel superior sin el prefijo `#`.

Flujo de una request típica (ver `auth`, en `start/routes.ts`):
1. Ruta registrada en `start/routes.ts`, agrupada bajo `/api/v1` con subgrupos `auth` (signup/login, públicas) y `account` (profile/logout, protegidas por `middleware.auth()`).
2. Controlador (`app/controllers/*.ts`) valida el body con `request.validateUsing(...)` contra un validador de `app/validators/user.ts` (VineJS).
3. Lógica de negocio delegada al modelo (`app/models/user.ts`, Lucid ORM + `withAuthFinder` para hash/verificación de contraseña).
4. Los tokens de acceso se emiten/revocan vía `User.accessTokens` (`DbAccessTokensProvider`), no hay sesiones para la API — el guard por defecto es `api` (tokens), configurado en `config/auth.ts`. Hay también un guard `web` (sesión) definido pero sin usar en las rutas actuales.
5. La respuesta se serializa con `ctx.serialize(...)` (método custom añadido a `HttpContext` en `providers/api_provider.ts`), que envuelve todo bajo `{ data: ... }` usando un `Transformer` (`app/transformers/*.ts`, `BaseTransformer.pick(...)`). Nunca devuelvas modelos Lucid crudos desde un controlador: pasa siempre por un transformer.

Generación de esquema: `database/schema.ts` es **autogenerado** desde las migraciones (`node ace migration:run` lo regenera) — no lo edites a mano; los modelos (`app/models/user.ts`) extienden esas clases `*Schema` vía `compose(...)`. Si cambias una migración, corre las migraciones de nuevo para que `schema.ts` y los tipos del modelo se actualicen.

Tuyau (`@tuyau/core`) genera un registro tipado de rutas/controladores en `.adonisjs/client/` para consumo tipado desde el frontend (`generateRegistry()` en `adonisrc.ts`, hook `init`). Esa carpeta y `.adonisjs/server/` son generadas, no se editan a mano.

Middleware relevante (`start/kernel.ts`): `force_json_response_middleware` fuerza `Accept: application/json` en todas las respuestas de error; `silent_auth_middleware` intenta autenticar sin fallar si no hay token (útil para rutas públicas que quieran saber si hay usuario); `auth_middleware` es el que sí exige autenticación y se usa explícitamente en rutas/grupos con `.use(middleware.auth())`.

## Arquitectura del frontend

Scaffold estándar de Vite + React 19 + TypeScript, sin router ni cliente HTTP configurado aún (`frontend/src/App.tsx` es el placeholder por defecto de Vite). Lint con `oxlint` (config en `.oxlintrc.json`), no ESLint/Prettier. Al añadir features que consuman la API, el backend expone todo bajo el prefijo `/api/v1` (ver arriba).

## Reglas de proceso

- Antes de tocar código: crear una rama nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main`/`s1/start`.
- Al cerrar la tarea: usar la skill `/commit`, luego `gh pr create` con una descripción completa de los cambios en el cuerpo del PR.
- Después de abrir el PR: usar el subagente `adversarial-reviewer` sobre él, antes de darlo por terminado.
- No repitas ese resumen en el chat: la sesión se va a perder, el PR no. Responde solo con la URL del PR.
