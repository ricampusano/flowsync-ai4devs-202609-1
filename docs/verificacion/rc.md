# Verificación y trazabilidad: «Lo que cada tarea muestra de su responsable»

Requisito: `openspec/specs/tasks/spec.md`, sección «Lo que cada tarea muestra de su responsable». Tests: `backend/tests/functional/tasks/assignee.spec.ts`. La matriz refleja el estado **tras** escribir los tests.

| Escenario | Test que lo cubre | Estado | Qué faltó para decidir |
|---|---|---|---|
| E1. Responsable identificable | `el responsable llega con su nombre y sus iniciales` | Cubierto | — |
| E2. La tarea no filtra datos de cuenta | `ninguna respuesta de tarea expone datos de cuenta del responsable` | Cubierto | — |
| E3. Responsable sin nombre | `sin nombre, el responsable llega con nombre nulo e iniciales` | Cubierto | — |

1. Creía que 1 de 3 escenarios estaba cubierto, estimación formulada tras una inspección previa (no es una predicción independiente anterior a la investigación); al verificar las aserciones, la cobertura inicial real era 0 de 3.
2. En E2 no tuve claro si faltaba un test o una regla en la especificación: el requisito pide nombre e iniciales y prohíbe «otros datos de cuenta», así que no sé si `assignee.id` está permitido.
3. En E2 tuve que decidir qué comprobar, porque el escenario no lo fijaba: elegí `email`, `createdAt` y `updatedAt`, en creación, listado y consulta individual de tareas.

## Evidencia

**Cobertura de tests (existencia de aserciones que verifican el escenario)**

- Inicial: **0/3**. Ningún test de `backend/tests/` llamaba a `/api/v1/tasks`; los de `auth/initials.spec.ts` y `auth/session.spec.ts` comprueban el perfil de cuenta y el login, no el `assignee` de una tarea.
- Final: **3/3**, con un test por escenario en `assignee.spec.ts`.

**Cumplimiento del requisito (resultado de ejecutar esos tests)**

Comando, desde `backend/`: `node ace test functional --files=assignee`. Resultado: 3 tests, **2 PASS y 1 FAIL**.

| Escenario | Resultado | Lo que dice el resultado |
|---|---|---|
| E1 | PASS | `assignee.fullName` es «Ada Lovelace» e `initials` es «AL» en `GET /tasks/:id`. |
| E2 | **FAIL** | El requisito **no se cumple** en dos de los tres endpoints comprobados (ver infracciones). |
| E3 | PASS | `assignee.fullName` está presente con valor `null` e `initials` es un texto no vacío en `GET /tasks/:id`. No se verifica su valor exacto. |

Seis infracciones detectadas en E2 (`assignee` con campos que el requisito no permite exponer):

- `POST /tasks`: `assignee.email`, `assignee.createdAt`, `assignee.updatedAt`
- `GET /tasks`: `assignee.email`, `assignee.createdAt`, `assignee.updatedAt`

`GET /tasks/:id` no presentó infracciones.

**Distinción**

E2 tiene cobertura (hay un test con aserciones que lo verifica) y a la vez presenta un fallo: tener test no equivale a cumplir el requisito. El test se conserva tal cual y no se ha modificado código de producción.

**Alcance de lo verificado**

- E1 y E3 se comprobaron solo en `GET /tasks/:id`, no en creación ni en listado.
- Los campos prohibidos de E2 son los tres elegidos (`email`, `createdAt`, `updatedAt`). No se comprobó ningún otro dato de cuenta ni se evaluó `assignee.id`.

**Hipótesis, no confirmada**

Por lectura del código, el serializador de la tarea usada en creación y listado podría reutilizar el transformer completo de usuario, mientras que el detalle usa uno recortado. No se ha comprobado con ninguna prueba y no se ha modificado producción.
