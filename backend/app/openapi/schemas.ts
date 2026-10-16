import type { OpenAPIV3 } from 'openapi-types'

/**
 * Esquemas reutilizables del documento OpenAPI. Cada uno refleja a mano lo que
 * entrega el transformer que se indica; si el transformer cambia, cambia aquí.
 * Se registran en `components.schemas` desde `config/openapi.ts` y los
 * controladores los referencian con `ref()`, `dataOf()` y `dataListOf()`.
 */

type Schema = OpenAPIV3.SchemaObject

type SchemaName = 'TaskAssignee' | 'Task' | 'TaskDetail' | 'ValidationErrors' | 'Unauthorized'

/** Referencia a un esquema de `components.schemas`. */
export const ref = (name: SchemaName) =>
  ({ $ref: `#/components/schemas/${name}` }) as unknown as Schema

/** `{ data: <esquema> }`: el envoltorio que añade `serialize()` a toda respuesta. */
export const dataOf = (name: SchemaName): Schema => ({
  type: 'object',
  properties: { data: ref(name) },
  required: ['data'],
})

/** `{ data: [<esquema>] }`. */
export const dataListOf = (name: SchemaName): Schema => ({
  type: 'object',
  properties: { data: { type: 'array', items: ref(name) } },
  required: ['data'],
})

/** Lo que `TaskAssigneeTransformer` entrega del responsable: `id`, `fullName` e `initials`. */
const TaskAssignee: Schema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    fullName: { type: 'string', nullable: true },
    initials: {
      type: 'string',
      description: 'Iniciales derivadas del nombre o, sin nombre, del email.',
    },
  },
  required: ['id', 'fullName', 'initials'],
}

/**
 * Copia de `TASK_STATUSES` (`#models/task`). No se importa a propósito: este
 * módulo lo carga `config/openapi.ts` antes de que arranque la aplicación, y
 * importar el modelo ahí arrastra `User` y el servicio `hash`, que todavía no
 * existe y queda `undefined` en toda la app.
 */
export const taskStatus: Schema = { type: 'string', enum: ['pending', 'in_progress', 'done'] }

/** Lo que `TaskTransformer` entrega: la tarea tal y como la devuelve la lista. */
const Task: Schema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    status: taskStatus,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
    assignee: ref('TaskAssignee'),
  },
  required: ['id', 'title', 'status', 'createdAt', 'updatedAt', 'assignee'],
}

/** Lo que `TaskDetailTransformer` entrega: `Task` más vencimiento y condición de vencida. */
const TaskDetail: Schema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    status: taskStatus,
    dueDate: {
      type: 'string',
      format: 'date',
      nullable: true,
      description: 'Día del calendario `AAAA-MM-DD`, o `null` si la tarea no tiene fecha.',
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
    isOverdue: {
      type: 'boolean',
      description:
        'Resuelto contra el `today` de la petición: con fecha anterior a `today` y sin estar `done`.',
    },
    assignee: ref('TaskAssignee'),
  },
  required: ['id', 'title', 'status', 'dueDate', 'createdAt', 'updatedAt', 'isOverdue', 'assignee'],
}

/** Cuerpo `{ errors: [...] }` de un 422 de VineJS. */
const ValidationErrors: Schema = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          rule: { type: 'string' },
          field: { type: 'string' },
          meta: { type: 'object', additionalProperties: true },
        },
        required: ['message', 'rule', 'field'],
      },
    },
  },
  required: ['errors'],
}

/** Cuerpo del 401 de las rutas protegidas: `{ errors: [{ message }] }`. */
const Unauthorized: Schema = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: { message: { type: 'string' } },
        required: ['message'],
      },
    },
  },
  required: ['errors'],
}

export const schemas: Record<SchemaName, Schema> = {
  TaskAssignee,
  Task,
  TaskDetail,
  ValidationErrors,
  Unauthorized,
}
