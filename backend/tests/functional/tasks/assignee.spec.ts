import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre el requisito «Lo que cada
 * tarea muestra de su responsable» de `openspec/specs/tasks/spec.md`, un test
 * por scenario.
 *
 * Se comprueba por las dos lecturas que devuelven tareas: la suelta
 * (`GET /tasks/:id`) y la lista (`GET /tasks`). Si una de las dos incumple, el
 * test falla y se queda fallando: es justo lo que hay que saber.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const HOY = '2026-10-15'

  async function sesion(client: any, email = 'quien.mira@example.com') {
    await User.create({ fullName: 'Quien Mira', email, password: 'secreto123' })

    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function tareaDe(fullName: string | null, email: string) {
    const responsable = await User.create({ fullName, email, password: 'secreto123' })

    return Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: responsable.id,
    })
  }

  test('el responsable llega con su nombre y sus iniciales', async ({ client, assert }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const response = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { assignee } = response.body().data
    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('la tarea no filtra el email ni datos de acceso del responsable', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const suelta = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)

    suelta.assertStatus(200)
    assert.notProperty(suelta.body().data.assignee, 'email')

    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    lista.assertStatus(200)

    const enLista = lista.body().data.find((t: { id: number }) => t.id === tarea.id)
    assert.exists(enLista)
    assert.notProperty(enLista.assignee, 'email')
    assert.notInclude(JSON.stringify(lista.body()), 'ada@example.com')
  })

  test('un responsable sin nombre llega con nombre nulo e iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe(null, 'ada@example.com')

    const suelta = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)

    suelta.assertStatus(200)
    assert.isNull(suelta.body().data.assignee.fullName)
    assert.equal(suelta.body().data.assignee.initials, 'AE')

    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    lista.assertStatus(200)

    const enLista = lista.body().data.find((t: { id: number }) => t.id === tarea.id)
    assert.exists(enLista)
    assert.isNull(enLista.assignee.fullName)
    assert.equal(enLista.assignee.initials, 'AE')
  })
})
