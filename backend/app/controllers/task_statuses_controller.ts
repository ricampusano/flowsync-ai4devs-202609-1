import Task from '#models/task'
import { updateTaskStatusValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import { dataOf, ref, taskStatus } from '#openapi/schemas'
import TaskTransformer from '#transformers/task_transformer'

@ApiBearerAuth()
export default class TaskStatusesController {
  /**
   * El estado es lo único mutable de una tarea en este momento, y por eso
   * tiene endpoint propio en vez de colgar de un update genérico: por ese
   * update acabarían colándose el título y el responsable, que son historias
   * que todavía no se han especificado.
   *
   * Cualquier persona con sesión puede cambiar el estado de cualquier tarea,
   * en cualquier dirección. No hay permisos por responsable ni transiciones
   * prohibidas: volver de «hecho» a «pendiente» es justamente lo que arregla
   * un clic dado por error.
   */
  @ApiOperation({
    summary: 'Cambiar el estado de una tarea',
    description:
      'Cualquier cuenta con sesión puede mover cualquier tarea a cualquiera de los tres estados.',
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: { status: taskStatus },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'La tarea ya en su nuevo estado.',
    schema: dataOf('Task'),
  })
  @ApiResponse({ status: 401, description: 'Sin sesión válida.', schema: ref('Unauthorized') })
  @ApiResponse({ status: 404, description: 'La tarea no existe.' })
  @ApiResponse({
    status: 422,
    description: '`status` ausente o distinto de los tres estados; la tarea conserva el que tenía.',
    schema: ref('ValidationErrors'),
  })
  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const { status } = await request.validateUsing(updateTaskStatusValidator)

    task.status = status
    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }
}
