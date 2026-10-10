# Spec Delta

## Purpose

Permitir al equipo mantener una única lista compartida de tareas, con su responsable y su estado a la vista, donde crear una tarea cuesta solo escribir un título y cambiar su estado cuesta un clic.

## ADDED Requirements

### Requirement: Listar las tareas del equipo

El sistema SHALL devolver, mediante `GET /api/v1/tasks`, todas las tareas del espacio, las mismas para cualquier persona autenticada, cada una con su título, su estado y su responsable.

#### Scenario: Lista común para todos

- **WHEN** dos personas distintas autenticadas piden la lista sin que nada cambie entre una petición y otra
- **THEN** las dos reciben exactamente el mismo conjunto de tareas

#### Scenario: Tareas de otras personas incluidas

- **WHEN** otra persona ha creado una tarea y la lista se pide después
- **THEN** esa tarea figura en la respuesta con su título, su estado y su responsable

#### Scenario: Responsable identificado por nombre

- **WHEN** se pide la lista y una tarea tiene responsable
- **THEN** el responsable de esa tarea viaja solo con su identificador y su nombre (nulo si no tiene), sin su correo, sus iniciales ni ningún otro dato de su cuenta

#### Scenario: Sin tareas

- **WHEN** se pide la lista y no se ha creado ninguna tarea
- **THEN** la respuesta es satisfactoria con una lista vacía

#### Scenario: Sin fechas

- **WHEN** se pide la lista
- **THEN** ninguna tarea incluye fecha de vencimiento ni marca de vencida

#### Scenario: Pedir la lista no modifica nada

- **WHEN** se pide la lista varias veces seguidas
- **THEN** ninguna tarea cambia de estado ni de responsable

### Requirement: Crear una tarea con solo el título

El sistema SHALL crear una tarea mediante `POST /api/v1/tasks` con un único dato obligatorio, el título, y SHALL devolverla ya creada.

#### Scenario: Creación correcta

- **WHEN** una persona autenticada envía un título válido
- **THEN** la respuesta es satisfactoria con la tarea creada y la tarea aparece en la lista a partir de ese momento

#### Scenario: Nace pendiente y a nombre de quien la crea

- **WHEN** una persona autenticada crea una tarea enviando solo el título
- **THEN** la tarea tiene estado `pending` y su responsable es esa persona

#### Scenario: Estado y responsable enviados se ignoran

- **WHEN** la petición de creación incluye además un estado o un responsable
- **THEN** la tarea nace igualmente en `pending` y con quien la crea como responsable

#### Scenario: Título sin espacios sobrantes

- **WHEN** se crea una tarea con un título que lleva espacios al principio o al final
- **THEN** la tarea se guarda con el título sin esos espacios

### Requirement: El título es obligatorio

El sistema SHALL rechazar con 422 la creación de una tarea cuyo título falte, esté vacío o contenga solo espacios, sin crear ninguna tarea.

#### Scenario: Título ausente o vacío

- **WHEN** se envía la creación sin título o con el título vacío
- **THEN** la respuesta es 422 con un error sobre el campo `title` y no se crea ninguna tarea

#### Scenario: Título en blanco

- **WHEN** se envía la creación con un título formado solo por espacios
- **THEN** la respuesta es 422 con un error sobre el campo `title` y no se crea ninguna tarea

### Requirement: Estados cerrados

El sistema SHALL admitir únicamente los estados `pending`, `in_progress` y `done`, y SHALL rechazar con 422 cualquier otro valor.

#### Scenario: Estado fuera del conjunto

- **WHEN** se actualiza una tarea con un estado que no es `pending`, `in_progress` ni `done` (por ejemplo `Hecho` o `blocked`)
- **THEN** la respuesta es 422 con un error sobre el campo `status` y la tarea no cambia

#### Scenario: Valores en castellano no válidos

- **WHEN** se actualiza una tarea con el estado `Pendiente`, `En curso` o `Hecho`
- **THEN** la respuesta es 422 con un error sobre el campo `status`

### Requirement: Actualizar estado y responsable

El sistema SHALL actualizar una tarea mediante `PATCH /api/v1/tasks/{id}`, aceptando su estado y su responsable, y SHALL permitirlo a cualquier persona autenticada sobre cualquier tarea.

#### Scenario: Cambio de estado

- **WHEN** una persona autenticada envía un estado válido para una tarea existente
- **THEN** la respuesta es satisfactoria con la tarea y su nuevo estado, y la lista lo refleja

#### Scenario: Tarea de otra persona

- **WHEN** una persona cambia el estado de una tarea cuyo responsable es otra persona
- **THEN** el cambio se aplica igual que en una tarea propia, sin permiso especial

#### Scenario: Cambio de responsable

- **WHEN** una persona autenticada envía como responsable a una persona registrada
- **THEN** la respuesta es satisfactoria y esa persona pasa a ser la responsable de la tarea

#### Scenario: Responsable inexistente

- **WHEN** se envía como responsable a una persona que no existe
- **THEN** la respuesta es 422 y la tarea no cambia

#### Scenario: Sin ningún dato que cambiar

- **WHEN** la petición de actualización no incluye ni estado ni responsable
- **THEN** la respuesta es 422 y la tarea no cambia

#### Scenario: Tarea inexistente

- **WHEN** se actualiza una tarea que no existe, aunque el cuerpo de la petición no sea válido
- **THEN** la respuesta es 404

#### Scenario: El título no se modifica

- **WHEN** la petición de actualización incluye un título distinto
- **THEN** el título de la tarea no cambia

### Requirement: Solo tres operaciones

El sistema SHALL ofrecer sobre las tareas únicamente listar, crear y actualizar, sin lectura individual, sin borrado y sin operaciones de equipo.

#### Scenario: Sin lectura individual

- **WHEN** se pide una tarea concreta con `GET /api/v1/tasks/{id}`
- **THEN** la respuesta es 404

#### Scenario: Sin borrado

- **WHEN** se envía `DELETE /api/v1/tasks/{id}`
- **THEN** la respuesta es 404 y la tarea sigue en la lista

### Requirement: Las operaciones de tareas exigen sesión

El sistema SHALL responder 401 a cualquier petición de tareas que no lleve un token de acceso válido.

#### Scenario: Sin token

- **WHEN** se lista, se crea o se actualiza una tarea sin token válido
- **THEN** la respuesta es 401 y no se devuelve ni se modifica ninguna tarea

### Requirement: Pantalla de la lista de tareas

La aplicación SHALL mostrar en `/tasks` a la persona con sesión la lista compartida de tareas, con el título, el responsable y el estado de cada una a la vista.

#### Scenario: Fila de tarea

- **WHEN** una persona con sesión abre la lista y hay tareas
- **THEN** cada tarea muestra su título, el nombre de su responsable y su estado como Pendiente, En curso o Hecho

#### Scenario: Responsable sin nombre

- **WHEN** el responsable de una tarea no tiene nombre
- **THEN** la fila muestra «Sin nombre», nunca su correo ni su identificador

#### Scenario: Sin fechas

- **WHEN** una persona abre la lista
- **THEN** no ve fechas ni marca de vencida en ninguna fila

#### Scenario: Carga y fallo de carga

- **WHEN** la lista se está pidiendo al servidor, o la petición falla
- **THEN** mientras espera se indica que está cargando y, si falla, aparece un aviso en castellano con la posibilidad de reintentar, sin mostrar la lista vacía como si no hubiera tareas

#### Scenario: Lista vacía

- **WHEN** una persona abre la lista y todavía no hay ninguna tarea
- **THEN** ve un texto que explica para qué sirve la lista y la invitación a crear la primera tarea, en lugar de una lista vacía sin más

#### Scenario: Una sola vista

- **WHEN** una persona busca otras vistas de tareas en la aplicación
- **THEN** no existe ninguna vista «mis tareas» ni señal de quién está conectado, solo la lista del equipo

#### Scenario: Sin sesión

- **WHEN** una persona sin sesión abre `/tasks`
- **THEN** es llevada a `/login` y no ve ninguna tarea

### Requirement: Crear una tarea desde la lista

La aplicación SHALL ofrecer en la pantalla de la lista un formulario que pide únicamente el título.

#### Scenario: Solo título

- **WHEN** una persona mira el formulario de creación
- **THEN** el título es el único campo y no se le ofrece ni sugiere responsable, estado ni fecha

#### Scenario: Tarea creada

- **WHEN** la persona escribe un título y pulsa el botón de crear
- **THEN** la tarea aparece en la lista sin recargar ni navegar, con estado Pendiente y su propio nombre como responsable, y el campo queda vacío

#### Scenario: Título vacío o en blanco

- **WHEN** la persona intenta crear una tarea con el título vacío o solo con espacios
- **THEN** aparece junto al campo un mensaje en castellano que explica que falta el título y no se añade ninguna fila

#### Scenario: Creación fallida

- **WHEN** el servidor no puede completar la creación (error del servidor o sin conexión)
- **THEN** aparece un aviso en castellano, no se añade ninguna fila y el título escrito se conserva en el campo

### Requirement: Cambiar el estado desde la fila

La aplicación SHALL permitir cambiar el estado de cualquier tarea desde su propia fila, ofreciendo solo Pendiente, En curso y Hecho.

#### Scenario: Cambio con un solo gesto

- **WHEN** la persona elige uno de los tres estados en la fila de una tarea
- **THEN** la fila muestra el nuevo estado de inmediato, sin abrir la tarea ni confirmar en ningún diálogo

#### Scenario: Tarea de otra persona

- **WHEN** la persona cambia el estado de una tarea cuyo responsable es otra
- **THEN** el cambio se aplica sin permiso ni advertencia

#### Scenario: Solo tres destinos

- **WHEN** la persona mira las opciones de estado de una fila
- **THEN** las únicas opciones son Pendiente, En curso y Hecho, y la tarea está en exactamente una de ellas

#### Scenario: Un cambio a la vez por fila

- **WHEN** hay un cambio de estado en curso en una fila
- **THEN** los botones de estado de esa fila no admiten otro cambio hasta que el servidor responda

#### Scenario: Sesión perdida durante un cambio

- **WHEN** el servidor responde 401 a una operación de tareas porque la sesión ya no es válida
- **THEN** la persona es llevada a `/login` con el aviso de sesión caducada y deja de ver tareas

#### Scenario: Cambio rechazado

- **WHEN** el servidor rechaza o no puede completar el cambio de estado
- **THEN** la fila vuelve a mostrar el estado anterior y aparece un aviso en castellano

### Requirement: Acceso entre la lista y el perfil

La aplicación SHALL enlazar la pantalla de la lista y la de perfil entre sí sin cambiar la pantalla de inicio.

#### Scenario: Del perfil a la lista

- **WHEN** una persona con sesión pulsa el enlace a las tareas en su perfil
- **THEN** pasa a `/tasks`

#### Scenario: De la lista al perfil

- **WHEN** una persona pulsa el enlace al perfil en la pantalla de la lista
- **THEN** pasa a `/profile`
