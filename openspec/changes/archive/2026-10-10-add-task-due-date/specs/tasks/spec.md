# Spec Delta

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Solo tres operaciones

**Reason**: La historia de fechas necesita abrir una tarea y ese endpoint no existía; la restricción pasa a cuatro operaciones.
**Migration**: Véase el requisito «Solo cuatro operaciones», que añade la lectura individual y mantiene la ausencia de borrado y de operaciones de equipo.

## ADDED Requirements

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
