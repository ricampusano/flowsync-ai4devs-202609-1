import Task from '#models/task'
import { createTaskValidator, updateTaskValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'

export default class TasksController {
  async index({ serialize }: HttpContext) {
    const tasks = await Task.query().preload('assignee')

    return serialize(TaskTransformer.transform(tasks))
  }

  async store({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { title } = await request.validateUsing(createTaskValidator)

    const task = await Task.create({ title, status: 'pending', assigneeId: user.id })
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }

  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const payload = await request.validateUsing(updateTaskValidator)

    task.merge(payload)
    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }
}
