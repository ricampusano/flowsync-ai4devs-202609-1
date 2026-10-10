import { TaskSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

/**
 * Conjunto cerrado de estados de una tarea, tal y como viajan por la API.
 */
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export default class Task extends TaskSchema {
  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>

  /**
   * Vencida: tiene fecha, es anterior al día de referencia (`YYYY-MM-DD`) y no
   * está hecha. Se compara como cadena ISO para no depender de husos ni horas.
   */
  isOverdue(today: string): boolean {
    const dueDate = this.dueDate?.toISODate()
    return dueDate !== null && dueDate !== undefined && dueDate < today && this.status !== 'done'
  }
}
