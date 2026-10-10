import vine from '@vinejs/vine'
import { TASK_STATUSES } from '#models/task'

/**
 * Fecha de calendario `YYYY-MM-DD`, sin hora. Nulable: enviarla vacía o `null`
 * la quita; omitirla la deja como está. `isOverdue` no figura en ningún
 * validador, así que cualquier valor enviado por el cliente se ignora.
 */
const dueDate = () =>
  vine
    .date({ formats: ['YYYY-MM-DD'] })
    .nullable()
    .optional()

/**
 * Validator to use when creating a task. The title is the only input.
 * Whitespace-only titles are rejected without altering the stored value.
 */
export const createTaskValidator = vine.create({
  title: vine.string().use(
    vine.createRule((value, _options, field) => {
      if (typeof value === 'string' && value.trim() === '') {
        field.report('The {{ field }} field must not be blank', 'required', field)
      }
    })()
  ),
  dueDate: dueDate(),
})

/**
 * Validator to use when updating the status, the assignee and/or the due date of a task.
 */
export const updateTaskValidator = vine.create({
  status: vine.enum(TASK_STATUSES).optional(),
  assigneeId: vine.number().exists({ table: 'users', column: 'id' }).optional(),
  dueDate: dueDate(),
})
