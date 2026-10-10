import vine from '@vinejs/vine'
import { TASK_STATUSES } from '#models/task'

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
})

/**
 * Validator to use when updating the status and/or the assignee of a task.
 */
export const updateTaskValidator = vine.create({
  status: vine.enum(TASK_STATUSES).optional(),
  assigneeId: vine.number().exists({ table: 'users', column: 'id' }).optional(),
})
