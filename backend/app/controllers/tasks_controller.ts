import Task from '#models/task'
import { createTaskValidator, updateTaskValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import { referenceDay } from '#services/reference_day'

export default class TasksController {
  async index({ request, serialize }: HttpContext) {
    const tasks = await Task.query().preload('assignee')

    return serialize(TaskTransformer.transform(tasks, referenceDay({ request })))
  }

  async show({ params, request, serialize }: HttpContext) {
    const task = await Task.query().where('id', params.id).preload('assignee').firstOrFail()

    return serialize(TaskTransformer.transform(task, referenceDay({ request })))
  }

  async store({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const { title, dueDate } = await request.validateUsing(createTaskValidator)

    const task = await Task.create({
      title,
      dueDate: dueDate ?? null,
      status: 'pending',
      assigneeId: user.id,
    })
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task, referenceDay({ request })))
  }

  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const payload = await request.validateUsing(updateTaskValidator)

    task.merge(payload)
    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task, referenceDay({ request })))
  }
}
