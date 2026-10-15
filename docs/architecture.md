# Arquitectura de FlowSync

Diagrama de contenedores (nivel 2 del modelo C4) del estado actual del código: una SPA de React que habla con una API REST de AdonisJS bajo `/api/v1`, la cual persiste en una base de datos SQLite local. Solo aparece lo verificado en el repositorio; no hay servicios externos, colas ni cachés porque no existen en el código.

```mermaid
C4Container
    title FlowSync — diagrama de contenedores

    Person(user, "Usuario", "Persona del equipo con cuenta que gestiona tareas")

    System_Boundary(flowsync, "FlowSync") {
        Container(spa, "Frontend SPA", "React 19, Vite 8, react-router, Tailwind v4, shadcn/ui", "Páginas /login, /register, /tasks, /tasks/:id y /profile. Guarda el token en localStorage (flowsync.token). Todo el acceso a la API pasa por src/lib/api.ts")

        Container(api, "API REST", "AdonisJS 7, VineJS 4", "Rutas bajo /api/v1: auth (signup, login), account (profile, logout) y tasks (index, store, show, status, due-date). Valida con validators, responde con transformers envueltos en { data }")

        ContainerDb(db, "Base de datos", "SQLite (better-sqlite3), Lucid 22", "Tablas users, auth_access_tokens y tasks. Fichero tmp/db.sqlite3, creado por las migraciones")
    }

    Rel(user, spa, "Usa", "Navegador")
    Rel(spa, api, "Llama a", "HTTP/JSON, Authorization: Bearer; URL desde VITE_API_URL")
    Rel(api, db, "Lee y escribe", "Lucid ORM: modelos User y Task")
```

## Componentes que sostienen el diagrama

| Contenedor | Dónde está en el código |
|---|---|
| Frontend SPA | `frontend/src/` — `pages/`, `routes/` (guards `protected-route` y `public-only-route`), `auth/`, `lib/api.ts` |
| API REST | `backend/start/routes.ts`, `backend/app/controllers/`, `validators/`, `transformers/`, `middleware/` |
| Base de datos | `backend/config/database.ts`, `backend/database/migrations/`, modelos en `backend/app/models/` |

Autenticación: el guard por defecto es `api` (access tokens opacos persistidos en `auth_access_tokens`); las rutas `account/*` y `tasks/*` se protegen con `middleware.auth()`.
