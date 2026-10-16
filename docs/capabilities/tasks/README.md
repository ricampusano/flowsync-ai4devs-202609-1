# Capability `tasks`

La lista de trabajo compartida del equipo: una sola lista para todo el espacio, donde apuntar una tarea cuesta escribir un título y donde el responsable y el estado de cada una se leen sin abrir nada.

> **Fuente de verdad de las reglas:** [`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md) (ver [ADR 0001](../../adr/0001-openspec-como-fuente-de-verdad.md)). Este README no las reproduce: cada apartado dice dónde están. Si algo de aquí contradice la spec o el código, manda la spec y este documento está desactualizado.

## Qué hace

- Crear una tarea, listarlas, ver una por separado y cambiar su estado y su fecha de vencimiento.
- Toda la capability está detrás de la sesión (token Bearer de `POST /api/v1/auth/login`).
- Frontend: la lista en `/tasks` y el detalle en `/tasks/:id` (`frontend/src/pages/tasks-page.tsx` y `task-page.tsx`).

## Endpoints

Todos bajo `/api/v1/tasks`, protegidos con `Authorization: Bearer <token>`, y con la respuesta envuelta en `{ "data": ... }`. Rutas en `backend/start/routes.ts`.

| Método | Ruta | Controlador | Qué hace |
|---|---|---|---|
| GET | `/api/v1/tasks` | `TasksController.index` | Lista; admite `?status=` |
| POST | `/api/v1/tasks` | `TasksController.store` | Crea una tarea con `{ "title" }` |
| GET | `/api/v1/tasks/:id` | `TasksController.show` | Detalle; exige `?today=AAAA-MM-DD` |
| PATCH | `/api/v1/tasks/:id/status` | `TaskStatusesController.update` | Cambia el estado con `{ "status" }` |
| PUT | `/api/v1/tasks/:id/due-date` | `TaskDueDatesController.update` | Fija o retira el vencimiento con `{ "today", "dueDate" }` |

El contrato detallado (parámetros, cuerpos, respuestas y esquemas) lo genera el código con OpenAPI: con el servidor arrancado, en `http://localhost:3333/api` (UI) y `/api.json`.

Las respuestas salen de `TaskTransformer` (lista, alta y cambio de estado) y `TaskDetailTransformer` (detalle y vencimiento, que añaden `dueDate` e `isOverdue`). El responsable sale de `TaskAssigneeTransformer`.

## Reglas de negocio

Las reglas viven en la spec; aquí solo se indica en qué requisitos buscarlas.

| Tema | Requisitos de la spec |
|---|---|
| Alta, título obligatorio y límite de longitud | «Creación de una tarea con solo el título», «Ninguna tarea sin título», «Aviso ante un título demasiado largo» |
| La lista y su alcance por defecto | «Una sola lista compartida del espacio» |
| Filtro por estado | «Acotar la lista por estado», «Un filtro válido sin resultados es una lista vacía legítima», «Un estado que no existe se rechaza, no se responde vacío» |
| Estados y cambio de estado | «Tres estados fijos», «Cambio de estado de cualquier tarea» |
| Responsable visible | «Lo que cada tarea muestra de su responsable» |
| Vencimiento y tarea vencida | «Fecha de vencimiento opcional», «Fijar, cambiar y retirar la fecha de vencimiento», «Cuándo una tarea está vencida», «El día de referencia lo pone quien mira» |
| Detalle y qué no lleva la lista | «Consulta de una tarea suelta», «La lista no lleva el vencimiento» |
| Sesión obligatoria | «Las tareas exigen sesión» |
| Pantallas | «Pantalla de la lista del equipo», «Pantalla de una tarea», «El espacio sin tareas», «El control para acotar la lista», y los demás requisitos de interfaz |

Dónde está implementado: el modelo (`backend/app/models/task.ts`: estados, alcance por defecto y la regla `isOverdueOn`), los validadores (`backend/app/validators/task.ts`) y los controladores.

### Divergencia conocida entre spec y código

El requisito «Un estado que no existe se rechaza, no se responde vacío» exige `422` ante un `status` inventado. `listTasksValidator` valida `status` como cadena cualquiera, así que, por lectura del código, `?status=archivado` devolvería `200` con lista vacía. No está confirmado con una ejecución ni corregido. La documentación OpenAPI describe el comportamiento implementado.

## Cómo probar en local

Los comandos se ejecutan desde `backend/` o `frontend/`; no hay `package.json` en la raíz.

### Arrancar

```bash
cd backend
npm install
cp .env.example .env && node ace generate:key   # solo la primera vez
node ace migration:run
npm run dev                                     # http://localhost:3333

cd ../frontend && npm install && npm run dev    # http://localhost:5173
```

### Probar la API a mano

```bash
# Registro y login (el token sale en data.token)
curl -s -X POST localhost:3333/api/v1/auth/signup -H 'content-type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"secreto123","passwordConfirmation":"secreto123"}'
TOKEN=$(curl -s -X POST localhost:3333/api/v1/auth/login -H 'content-type: application/json' \
  -d '{"email":"ada@example.com","password":"secreto123"}' | jq -r .data.token)

curl -s -X POST localhost:3333/api/v1/tasks -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{"title":"Revisar el informe"}'
curl -s localhost:3333/api/v1/tasks -H "Authorization: Bearer $TOKEN"
curl -s "localhost:3333/api/v1/tasks/1?today=$(date +%F)" -H "Authorization: Bearer $TOKEN"
```

Esto escribe en la base de desarrollo (`backend/tmp/db.sqlite3`).

### Tests automáticos

```bash
cd backend
npm test                              # Japa (hoy solo existe la suite functional)
node ace test functional --files=assignee
```

Hoy la capability solo tiene el test del responsable (`backend/tests/functional/tasks/assignee.spec.ts`); el resto de los requisitos de la spec no tiene prueba automática.

Dos cautelas al probar:

- Las suites functional usan **el mismo fichero SQLite** que el servidor de desarrollo. Para el servidor antes de lanzar `npm test` y, en los tests que escriben, aísla con `testUtils.db().withGlobalTransaction()`, como hace `assignee.spec.ts`.
- `npm run typecheck` falla hoy en `assignee.spec.ts` (líneas 73 y 99), un fallo previo e independiente de la capability.
