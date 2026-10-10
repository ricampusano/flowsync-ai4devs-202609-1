# tasks Specification

## Purpose
Permitir al equipo mantener una única lista compartida de tareas, con su responsable y su estado a la vista, donde crear una tarea cuesta solo escribir un título y cambiar su estado cuesta un clic.

## Requirements

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

- **WHEN** se pide la lista y una tarea no tiene fecha de vencimiento
- **THEN** esa tarea viaja con la fecha nula y `isOverdue` falso

#### Scenario: Fecha y vencimiento en la representación

- **WHEN** se pide la lista
- **THEN** cada tarea incluye su fecha de vencimiento (nula si no tiene) y el campo booleano `isOverdue`

#### Scenario: Pedir la lista no modifica nada

- **WHEN** se pide la lista varias veces seguidas
- **THEN** ninguna tarea cambia de estado, de responsable ni de fecha

### Requirement: Crear una tarea con solo el título

El sistema SHALL crear una tarea mediante `POST /api/v1/tasks` con un único dato obligatorio, el título, y SHALL devolverla ya creada.

#### Scenario: Creación correcta

- **WHEN** una persona autenticada envía un título válido
- **THEN** la respuesta es satisfactoria con la tarea creada y la tarea aparece en la lista a partir de ese momento

#### Scenario: Nace pendiente y a nombre de quien la crea

- **WHEN** una persona autenticada crea una tarea enviando solo el título
- **THEN** la tarea tiene estado `pending` y su responsable es esa persona

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

#### Scenario: Tarea inexistente

- **WHEN** se actualiza una tarea que no existe
- **THEN** la respuesta es 404

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
- **THEN** la tarea aparece en la lista sin recargar ni navegar, con estado Pendiente y su propio nombre como responsable

#### Scenario: Título vacío o en blanco

- **WHEN** la persona intenta crear una tarea con el título vacío o solo con espacios
- **THEN** aparece junto al campo un mensaje en castellano que explica que falta el título y no se añade ninguna fila

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

### Requirement: Acceso entre la lista y el perfil

La aplicación SHALL enlazar la pantalla de la lista y la de perfil entre sí sin cambiar la pantalla de inicio.

#### Scenario: Del perfil a la lista

- **WHEN** una persona con sesión pulsa el enlace a las tareas en su perfil
- **THEN** pasa a `/tasks`

#### Scenario: De la lista al perfil

- **WHEN** una persona pulsa el enlace al perfil en la pantalla de la lista
- **THEN** pasa a `/profile`

### Requirement: Solo cuatro operaciones

El sistema SHALL ofrecer sobre las tareas únicamente listar, leer una, crear y actualizar, sin borrado y sin operaciones de equipo.

#### Scenario: Lectura individual

- **WHEN** se pide una tarea existente con `GET /api/v1/tasks/{id}`
- **THEN** la respuesta es satisfactoria con esa tarea, su fecha de vencimiento y `isOverdue`

#### Scenario: Lectura de una tarea inexistente

- **WHEN** se pide con `GET /api/v1/tasks/{id}` una tarea que no existe
- **THEN** la respuesta es 404

#### Scenario: Sin borrado

- **WHEN** se envía `DELETE /api/v1/tasks/{id}`
- **THEN** la respuesta es 404 y la tarea sigue en la lista

### Requirement: Fecha de vencimiento opcional

El sistema SHALL permitir que una tarea tenga una fecha de vencimiento de calendario, sin hora, que se puede poner al crear o actualizar, cambiar y quitar, y que por defecto no tiene.

#### Scenario: Tarea sin fecha por defecto

- **WHEN** se crea una tarea enviando solo el título
- **THEN** la tarea nace con fecha de vencimiento nula

#### Scenario: Poner la fecha

- **WHEN** se actualiza una tarea sin fecha enviando una fecha de calendario válida
- **THEN** la respuesta es satisfactoria y la tarea queda con esa fecha

#### Scenario: Crear con fecha

- **WHEN** se crea una tarea enviando título y una fecha de calendario válida
- **THEN** la tarea nace con esa fecha

#### Scenario: Cambiar la fecha

- **WHEN** se actualiza una tarea con fecha enviando otra fecha válida
- **THEN** la tarea queda con la nueva fecha

#### Scenario: Quitar la fecha

- **WHEN** se actualiza una tarea con fecha enviando la fecha explícitamente vacía
- **THEN** la tarea queda sin fecha y deja de estar vencida si lo estaba

#### Scenario: Fecha no enviada

- **WHEN** se actualiza una tarea con fecha enviando solo su estado
- **THEN** la fecha de la tarea no cambia

#### Scenario: Fecha ya pasada aceptada

- **WHEN** se pone una fecha anterior a hoy, al crear o al actualizar
- **THEN** la fecha se acepta y la tarea no hecha pasa a estar vencida

#### Scenario: Fecha imposible o incompleta

- **WHEN** se envía una fecha que no existe en el calendario o está incompleta
- **THEN** la respuesta es 422 con un error sobre el campo de la fecha y la tarea conserva la que tuviera

#### Scenario: Cualquier persona sobre cualquier tarea

- **WHEN** una persona autenticada pone o quita la fecha de una tarea cuyo responsable es otra
- **THEN** el cambio se aplica sin advertencia ni permiso especial

#### Scenario: Reasignar no toca la fecha

- **WHEN** se cambia el responsable de una tarea con fecha
- **THEN** la fecha y el valor de `isOverdue` de la tarea son los mismos

### Requirement: Regla de tarea vencida

El sistema SHALL marcar una tarea como vencida, con `isOverdue` verdadero, solo cuando tiene fecha de vencimiento, esa fecha es anterior al día de referencia y su estado no es `done`.

#### Scenario: Fecha anterior a hoy

- **WHEN** se lee una tarea no hecha cuya fecha es anterior al día de referencia
- **THEN** `isOverdue` es verdadero

#### Scenario: Fecha de hoy

- **WHEN** se lee una tarea no hecha cuya fecha es el propio día de referencia
- **THEN** `isOverdue` es falso

#### Scenario: Fecha futura

- **WHEN** se lee una tarea con fecha posterior al día de referencia
- **THEN** `isOverdue` es falso

#### Scenario: Sin fecha

- **WHEN** se lee una tarea sin fecha, por antigua que sea
- **THEN** `isOverdue` es falso

#### Scenario: Tarea hecha

- **WHEN** se lee una tarea en estado `done` cuya fecha ya pasó
- **THEN** `isOverdue` es falso

#### Scenario: Hecha conserva la fecha

- **WHEN** una tarea vencida pasa a `done`
- **THEN** `isOverdue` pasa a falso y su fecha de vencimiento no cambia

#### Scenario: Aplazar resuelve el vencimiento

- **WHEN** una tarea vencida recibe una fecha posterior al día de referencia
- **THEN** `isOverdue` pasa a falso

### Requirement: El veredicto se calcula en cada lectura

El sistema SHALL calcular `isOverdue` en cada respuesta que incluye una tarea, sin persistirlo, y SHALL ignorar cualquier valor de `isOverdue` enviado por el cliente.

#### Scenario: Vence sola con el paso del día

- **WHEN** una tarea no hecha con fecha de ayer se lee con el día de referencia de hoy, sin que nadie la haya modificado desde que su fecha era hoy
- **THEN** `isOverdue` es verdadero

#### Scenario: Valor enviado por el cliente ignorado

- **WHEN** una petición de creación o actualización incluye `isOverdue`
- **THEN** ese valor no se tiene en cuenta y la respuesta trae el veredicto calculado

### Requirement: Día de referencia del cliente

El sistema SHALL calcular el vencimiento respecto al día de calendario que el cliente envía en la cabecera `X-Client-Date` con formato `YYYY-MM-DD`, y SHALL usar su propia fecha cuando la petición no la trae.

#### Scenario: Dos personas, dos días

- **WHEN** dos personas piden a la vez una misma tarea no hecha cuya fecha es el día de una y anterior al de la otra, cada una con su propio `X-Client-Date`
- **THEN** a la primera `isOverdue` le sale falso y a la segunda verdadero

#### Scenario: Sin día del cliente

- **WHEN** se lee una tarea sin la cabecera `X-Client-Date`
- **THEN** la respuesta trae `isOverdue` calculado con la fecha del servidor

### Requirement: Abrir una tarea desde la lista

La aplicación SHALL permitir abrir una tarea desde su fila de la lista, sin que la lista muestre fecha ni marca de vencida.

#### Scenario: Abrir

- **WHEN** una persona con sesión pulsa el título de una tarea en la lista
- **THEN** pasa a `/tasks/{id}` y ve el título de esa tarea

#### Scenario: La lista sigue igual

- **WHEN** hay tareas con fecha, algunas vencidas
- **THEN** la lista solo muestra el título, el responsable y el estado de cada una, sin ninguna fecha ni marca de vencida, y una tarea sin fecha no muestra aviso alguno

#### Scenario: Sin sesión

- **WHEN** una persona sin sesión abre `/tasks/{id}`
- **THEN** es llevada a `/login` y no ve la tarea

### Requirement: Editar la fecha al abrir la tarea

La aplicación SHALL permitir en `/tasks/:id` poner, cambiar y quitar la fecha de vencimiento, reflejándola al instante y guardándola sin ningún paso extra de guardado.

#### Scenario: Poner o cambiar la fecha

- **WHEN** la persona indica una fecha completa y válida en el campo
- **THEN** la fecha queda guardada y se ve reflejada sin recargar ni volver a abrir la tarea

#### Scenario: Quitar la fecha

- **WHEN** la persona pulsa la acción de quitar la fecha
- **THEN** la tarea queda sin fecha de inmediato, sin diálogo de confirmación

#### Scenario: Fecha rechazada

- **WHEN** el servidor rechaza la fecha por no ser válida
- **THEN** se mantiene la fecha anterior y aparece junto al campo un mensaje en castellano

#### Scenario: Tarea de otra persona

- **WHEN** la persona cambia la fecha de una tarea cuyo responsable es otro
- **THEN** el cambio se aplica sin advertencia ni permiso especial

#### Scenario: Tarea sin fecha

- **WHEN** la persona abre una tarea sin fecha
- **THEN** no ve aviso, recordatorio ni señal de que le falte algo

### Requirement: Señal de tarea vencida al abrirla

La aplicación SHALL indicar de forma explícita, con texto y no solo con color, que una tarea está vencida cuando el servidor la marca así, sin que la persona deba comparar la fecha con hoy.

#### Scenario: Tarea vencida

- **WHEN** la persona abre una tarea cuyo `isOverdue` es verdadero
- **THEN** ve la indicación textual «Vencida» junto a su fecha

#### Scenario: Tarea no vencida

- **WHEN** la persona abre una tarea cuyo `isOverdue` es falso (fecha de hoy, futura, sin fecha o hecha)
- **THEN** no ve la indicación de vencida

#### Scenario: Poner una fecha pasada

- **WHEN** la persona pone una fecha anterior a hoy en una tarea no hecha
- **THEN** la tarea pasa a mostrarse vencida de inmediato

#### Scenario: Quitar la fecha de una tarea vencida

- **WHEN** la persona quita la fecha de una tarea vencida
- **THEN** la indicación de vencida desaparece
