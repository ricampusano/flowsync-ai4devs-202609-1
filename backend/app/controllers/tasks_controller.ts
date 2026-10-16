import Task, { DEFAULT_LIST_STATUSES } from '#models/task'
import {
  createTaskValidator,
  listTasksValidator,
  taskReferenceDayValidator,
  toCalendarDay,
} from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@foadonis/openapi/decorators'
import { dataListOf, dataOf, ref } from '#openapi/schemas'
import TaskTransformer from '#transformers/task_transformer'
import TaskDetailTransformer from '#transformers/task_detail_transformer'

@ApiBearerAuth()
export default class TasksController {
  /**
   * La lista del espacio: una sola, la misma para todo el mundo, sin filtrar
   * por quién la pide. El responsable va precargado en la misma consulta —
   * es el 100 % de los accesos y resolverlo tarea a tarea sería el error caro
   * y evidente aquí.
   *
   * Admite acotarse por estado, y aquí hay tres caminos que no se cruzan:
   * un estado válido devuelve solo el suyo (aunque no haya ninguna, y eso es
   * una lista vacía legítima, no un error); no pedir nada devuelve lo que
   * sigue abierto; y un estado que no existe ni siquiera llega, porque el
   * validador lo corta antes con un 422. Devolverlo vacío sería el fallo
   * silencioso que esta lista no se puede permitir.
   *
   * Acotar es solo lectura: ninguna tarea cambia por consultarla.
   */
  @ApiOperation({
    summary: 'Listar las tareas del espacio',
    description:
      'Sin `status` devuelve las tareas `pending` e `in_progress`; las `done` solo salen al pedirlas con `status=done`. ' +
      'Ordenadas de la más reciente a la más antigua. ' +
      '**Divergencia con OpenSpec:** la especificación exige un 422 sobre `status` si el valor no es uno de los tres estados; ' +
      'la implementación actual acepta cualquier cadena y un valor desconocido (p. ej. `archivado`) devuelve `200` con `data: []`.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Acota la lista a un estado: `pending`, `in_progress` o `done`.',
    schema: { type: 'string' },
  })
  @ApiResponse({ status: 200, description: 'Lista de tareas.', schema: dataListOf('Task') })
  @ApiResponse({ status: 401, description: 'Sin sesión válida.', schema: ref('Unauthorized') })
  async index({ request, serialize }: HttpContext) {
    const { status } = await request.validateUsing(listTasksValidator)

    const query = Task.query().preload('assignee')

    if (status) {
      query.where('status', status)
    } else {
      // Sin filtro no es «todas»: lo hecho se queda fuera.
      query.whereIn('status', [...DEFAULT_LIST_STATUSES])
    }

    const tasks = await query
      .orderBy('createdAt', 'desc')
      // Desempate estable: dos tareas creadas en el mismo milisegundo tienen
      // la misma marca de tiempo, y sin esto su orden relativo sería el que
      // quisiera la base de datos.
      .orderBy('id', 'desc')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * Una tarea suelta, con todo lo que tiene: es la única lectura que informa
   * del vencimiento, y por eso es la única que exige el día de quien mira.
   */
  @ApiOperation({
    summary: 'Ver una tarea con todo su detalle',
    description: 'Única lectura que informa del vencimiento; por eso exige `today`.',
  })
  @ApiQuery({
    name: 'today',
    required: true,
    description: 'Día de quien mira, `AAAA-MM-DD`, contra el que se resuelve `isOverdue`.',
    schema: { type: 'string', format: 'date' },
  })
  @ApiResponse({ status: 200, description: 'La tarea.', schema: dataOf('TaskDetail') })
  @ApiResponse({ status: 401, description: 'Sin sesión válida.', schema: ref('Unauthorized') })
  @ApiResponse({ status: 404, description: 'La tarea no existe.' })
  @ApiResponse({
    status: 422,
    description: '`today` ausente o no es una fecha válida.',
    schema: ref('ValidationErrors'),
  })
  async show({ params, request, serialize }: HttpContext) {
    const { today } = await request.validateUsing(taskReferenceDayValidator)
    const task = await Task.findOrFail(params.id)
    await task.load('assignee')

    return serialize(TaskDetailTransformer.transform(task, toCalendarDay(today)))
  }

  /**
   * Crear cuesta un título. El responsable y el estado no se leen de la
   * petición ni aunque vengan: los pone el sistema.
   */
  @ApiOperation({
    summary: 'Crear una tarea',
    description:
      'Nace `pending` y a nombre de quien la crea; `status` y el responsable no se leen del cuerpo.',
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Se recortan los espacios de los extremos antes de validar.',
        },
      },
      required: ['title'],
    },
  })
  @ApiResponse({ status: 201, description: 'Tarea creada.', schema: dataOf('Task') })
  @ApiResponse({ status: 401, description: 'Sin sesión válida.', schema: ref('Unauthorized') })
  @ApiResponse({
    status: 422,
    description: '`title` ausente, vacío o de más de 200 caracteres.',
    schema: ref('ValidationErrors'),
  })
  async store({ request, response, auth, serialize }: HttpContext) {
    const { title } = await request.validateUsing(createTaskValidator)
    const user = auth.getUserOrFail()

    // El estado va explícito y no se deja al valor por defecto de la columna:
    // el modelo recién creado no vuelve a leerse de la base de datos, así que
    // ese defecto no llegaría a la respuesta.
    const task = await Task.create({ title, status: 'pending', assigneeId: user.id })
    await task.load('assignee')

    // El estado se marca aparte y el cuerpo se devuelve: `serialize()` entrega
    // una promesa que resuelve el pipeline al devolverla, y pasársela a
    // `response.created()` deja la respuesta con el cuerpo vacío.
    response.status(201)
    return serialize(TaskTransformer.transform(task))
  }
}
