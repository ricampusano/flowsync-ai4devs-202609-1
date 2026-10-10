import type Task from '#models/task'
import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Del responsable solo viaja el id (necesario para reasignar) y el nombre.
 */
class TaskAssigneeTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, ['id', 'fullName'])
  }
}

export default class TaskTransformer extends BaseTransformer<Task> {
  constructor(
    resource: Task,
    private today: string
  ) {
    super(resource)
  }

  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'status']),
      dueDate: this.resource.dueDate?.toISODate() ?? null,
      isOverdue: this.resource.isOverdue(this.today),
      assignee: TaskAssigneeTransformer.transform(this.resource.assignee),
    }
  }
}
