# Tasks

> Sin tests por decisión explícita del change: la verificación de cada tarea es un comando de compilación o lint, o un comportamiento observable en la API o en la pantalla.

## 1. Modelo de datos

- [ ] 1.1 Crear la migración de `tasks` (título, estado por defecto `pending`, responsable con FK a `users`, marcas de tiempo; sin fecha de vencimiento) y ejecutar `node ace migration:run`; verificar que `database/schema.ts` se regenera con la nueva tabla y que no contiene ninguna columna de fecha de vencimiento
- [ ] 1.2 Crear el modelo `Task` con la relación `assignee` hacia `User` y verificar `npm run typecheck` en `backend/`

## 2. API de tareas

- [ ] 2.1 Crear los validadores de creación (título con trim, obligatorio, sin máximo) y de actualización (estado enum `pending`/`in_progress`/`done` definido una sola vez, `assigneeId` existente) y la comprobación en el controlador de que llega al menos uno, con 404 antes que 422 y verificar `npm run typecheck`
- [ ] 2.2 Crear el transformer de tarea que expone `id`, `title`, `status` y `assignee { id, fullName }` y verificar que no incluye correo ni iniciales del usuario
- [ ] 2.3 Crear el controlador con `index`, `store` y `update` (creación en `pending` y con `auth.user` como responsable; sin `orderBy`) y registrar el grupo `/api/v1/tasks` con `middleware.auth()` solo para esas tres acciones; verificar con `node ace list:routes` que existen exactamente `GET`, `POST` y `PATCH /:id`
- [ ] 2.4 Verificar a mano con `curl` y un token los scenarios de la spec: lista vacía, crear solo con título (nace `pending` y a nombre de quien crea), 422 con título vacío o en blanco, 422 con estado `Hecho`, cambio de estado de una tarea ajena, 404 en `GET` y `DELETE` de `/:id` y 401 sin token
- [ ] 2.5 Commitear el diff regenerado de `.adonisjs/` tras arrancar el servidor y verificar con `git status` que no quedan ficheros generados sin versionar

## 3. Interfaz de tareas

- [ ] 3.1 Añadir los tipos de tarea a `lib/types.ts` y `getTasks`, `createTask` y `updateTask` a `lib/api.ts` (con `PATCH`, la etiqueta «el título» y la regla de longitud mínima del título mapeada a «Falta rellenar el título.» en la traducción de errores) y verificar `npm run build` en `frontend/`
- [ ] 3.2 Crear la página de tareas con el formulario de solo título, la lista con título, responsable (`Sin nombre` si no lo tiene) y estado, sin fechas ni ordenación, y los estados cargando y error con reintento, el aviso si falla la creación conservando el título y el estado vacío con su invitación a crear la primera; verificar `npm run build` y `npm run lint`
- [ ] 3.3 Añadir los tres botones de estado por fila (Pendiente, En curso, Hecho) con cambio optimista, botones de la fila deshabilitados mientras hay petición, restauración y aviso si falla, y cierre de sesión con redirección a `/login` ante un 401; verificar en el navegador que el cambio es inmediato, que funciona en tareas ajenas, que solo hay tres opciones y que revocar el token en otra pestaña lleva a `/login`
- [ ] 3.4 Registrar `/tasks` bajo `ProtectedRoute` y enlazar perfil y lista entre sí sin cambiar el inicio; verificar que sin sesión `/tasks` lleva a `/login` y que el comodín sigue llevando a `/profile`

## 4. Cierre

- [ ] 4.1 Recorrer en el navegador los scenarios de la spec delta con dos cuentas distintas (misma lista para ambas, tarea de una visible para la otra, ningún dato de correo en pantalla) y ejecutar `npm run lint`, `npm run build` y `npm run typecheck` sin errores
