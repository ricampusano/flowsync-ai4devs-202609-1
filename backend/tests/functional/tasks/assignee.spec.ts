import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: responsable identificable, la tarea no filtra
 * datos de cuenta y responsable sin nombre.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  /** Día de referencia que exige `GET /tasks/:id`; su valor no importa aquí. */
  const HOY = '2026-01-01'

  async function sesion(client: any, email: string) {
    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  test('el responsable llega con su nombre y sus iniciales', async ({ client, assert }) => {
    const ada = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const tarea = await Task.create({
      title: 'Escribir el motor analítico',
      status: 'pending',
      assigneeId: ada.id,
    })
    const token = await sesion(client, 'ada@example.com')

    const response = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { assignee } = response.body().data
    assert.equal(assignee.fullName, 'Ada Lovelace')
    // Dos palabras dan la inicial de cada una (requisito «Iniciales de la
    // cuenta» de `openspec/specs/auth/spec.md`).
    assert.equal(assignee.initials, 'AL')
  })

  test('ninguna respuesta de tarea expone datos de cuenta del responsable', async ({
    client,
    assert,
  }) => {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const token = await sesion(client, 'ada@example.com')
    const autorizacion = `Bearer ${token}`

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', autorizacion)
      .json({ title: 'Escribir el motor analítico' })

    creada.assertStatus(201)
    const id = creada.body().data.id

    const listada = await client.get('/api/v1/tasks').header('Authorization', autorizacion)

    listada.assertStatus(200)
    const enLista = listada.body().data.find((tarea: { id: number }) => tarea.id === id)

    const suelta = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: HOY })
      .header('Authorization', autorizacion)

    suelta.assertStatus(200)

    // Sin la tarea y su `assignee` en las tres respuestas, el test pasaría en vacío.
    assert.isDefined(enLista, 'GET /tasks no devuelve la tarea recién creada')

    const respuestas: Array<[string, any]> = [
      ['POST /tasks', creada.body().data],
      ['GET /tasks', enLista],
      ['GET /tasks/:id', suelta.body().data],
    ]

    // Se recogen todas las infracciones antes de asertar: el primer endpoint
    // que falla no debe ocultar a los demás.
    const prohibidos = ['email', 'createdAt', 'updatedAt']
    const infracciones: string[] = []

    for (const [endpoint, tarea] of respuestas) {
      assert.isObject(tarea?.assignee, `${endpoint} no trae assignee`)

      for (const campo of prohibidos) {
        if (campo in tarea.assignee) {
          infracciones.push(`${endpoint}: assignee.${campo}`)
        }
      }
    }

    assert.deepEqual(infracciones, [])
  })

  test('sin nombre, el responsable llega con nombre nulo e iniciales', async ({
    client,
    assert,
  }) => {
    const anonimo = await User.create({
      fullName: null,
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const tarea = await Task.create({
      title: 'Tarea de una cuenta sin nombre',
      status: 'pending',
      assigneeId: anonimo.id,
    })
    const token = await sesion(client, 'ada@example.com')

    const response = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { assignee } = response.body().data
    // Nulo, no ausente: la interfaz distingue «sin nombre» de «dato que no llegó».
    assert.property(assignee, 'fullName')
    assert.isNull(assignee.fullName)
    assert.isString(assignee.initials)
    assert.isNotEmpty(assignee.initials)
  })
})
