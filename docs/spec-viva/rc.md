## Purpose

Permitir que una persona cree una cuenta en FlowSync, inicie y cierre sesión, consulte su perfil, y que el acceso a las pantallas y datos de la cuenta quede limitado a quien tiene una sesión válida.

## Requirements

### Requirement: El registro crea la cuenta y devuelve una sesión válida

El sistema SHALL permitir registrar una cuenta nueva con nombre (opcional), email y contraseña, y SHALL responder con los datos públicos de la cuenta creada y una credencial de sesión válida, de modo que quien se registra queda autenticado sin necesidad de iniciar sesión aparte. La respuesta de un registro correcto SHALL tener estado 200.

#### Scenario: Registro correcto con nombre

- **WHEN** se envía un registro con nombre, un email no registrado, una contraseña válida y su confirmación idéntica
- **THEN** el sistema responde con estado 200
- **THEN** la respuesta contiene los datos de la cuenta (identificador, nombre, email, fechas de creación y actualización) y una credencial de sesión
- **THEN** la respuesta no contiene la contraseña

#### Scenario: Registro correcto sin nombre

- **WHEN** se envía un registro con el nombre vacío (`null`) y el resto de datos válidos
- **THEN** el sistema crea la cuenta con el nombre vacío y responde con estado 200 y una credencial de sesión

#### Scenario: La credencial devuelta por el registro da acceso al perfil

- **WHEN** se solicita el perfil usando la credencial recibida en un registro correcto
- **THEN** el sistema devuelve el perfil de la cuenta recién creada

#### Scenario: Registro desde la interfaz

- **WHEN** una persona sin sesión completa el formulario de registro con datos válidos y lo envía
- **THEN** queda autenticada y la interfaz la lleva a la pantalla de perfil

### Requirement: El email se recorta de espacios al inicio y al final

El sistema SHALL ignorar los espacios al inicio y al final del email, tanto al registrarse como al iniciar sesión.

#### Scenario: Registro con espacios alrededor del email

- **WHEN** se envía un registro con el email `"  persona@example.com  "`
- **THEN** el sistema acepta el registro con estado 200
- **THEN** la cuenta queda con el email `persona@example.com`, sin espacios

#### Scenario: Login con espacios alrededor del email

- **WHEN** se inicia sesión con el email `" persona@example.com "` y la contraseña correcta de esa cuenta
- **THEN** el sistema responde con estado 200 y una sesión de esa cuenta

### Requirement: El email distingue mayúsculas de minúsculas

El sistema SHALL tratar como emails distintos los que difieren solo en mayúsculas y minúsculas, tanto en el registro como en el login.

#### Scenario: Registrar un email que solo difiere en el uso de mayúsculas

- **WHEN** ya existe una cuenta con `persona@example.com` y se registra una cuenta con `PERSONA@EXAMPLE.COM`
- **THEN** el sistema acepta el registro con estado 200 y crea una cuenta distinta, que conserva el email tal como se escribió

#### Scenario: Login con otra combinación de mayúsculas

- **WHEN** se inicia sesión con `Persona@Example.com` y la contraseña de la cuenta registrada como `persona@example.com`, y no existe ninguna cuenta con ese email exacto
- **THEN** el sistema rechaza el login como credenciales incorrectas

### Requirement: El login válido crea una sesión

El sistema SHALL permitir iniciar sesión con el email y la contraseña de una cuenta existente, y SHALL responder con los datos públicos de la cuenta y una credencial de sesión. Cada login válido SHALL generar una credencial nueva.

#### Scenario: Login correcto

- **WHEN** se inicia sesión con el email y la contraseña correctos de una cuenta
- **THEN** el sistema responde con estado 200
- **THEN** la respuesta contiene los datos de la cuenta y una credencial de sesión
- **THEN** la respuesta no contiene la contraseña

#### Scenario: Dos logins consecutivos

- **WHEN** se inicia sesión dos veces con las mismas credenciales válidas
- **THEN** cada respuesta contiene una credencial de sesión distinta

#### Scenario: Login desde la interfaz

- **WHEN** una persona sin sesión introduce credenciales correctas en la pantalla de inicio de sesión y las envía
- **THEN** queda autenticada y la interfaz la lleva a la pantalla de perfil

### Requirement: Las credenciales incorrectas son rechazadas

El sistema SHALL rechazar el login cuando el email no corresponde a una cuenta o la contraseña no coincide, SHALL responder con estado 400 y SHALL NOT crear ninguna sesión. La respuesta SHALL ser la misma para un email inexistente y para una contraseña errónea.

#### Scenario: Contraseña incorrecta

- **WHEN** se inicia sesión con el email de una cuenta existente y una contraseña incorrecta
- **THEN** el sistema responde con estado 400 y un único error con el mensaje `Invalid user credentials`, sin indicar a qué campo se refiere

#### Scenario: Email inexistente

- **WHEN** se inicia sesión con un email que no corresponde a ninguna cuenta
- **THEN** el sistema responde con estado 400 y el mismo cuerpo que en el caso de contraseña incorrecta

#### Scenario: Credenciales incorrectas desde la interfaz

- **WHEN** una persona envía credenciales incorrectas desde la pantalla de inicio de sesión
- **THEN** la interfaz muestra el mensaje "El email o la contraseña no son correctos." y la persona permanece en la pantalla de inicio de sesión sin sesión iniciada

### Requirement: El perfil requiere autenticación

El sistema SHALL denegar la consulta del perfil a quien no presente una credencial de sesión válida, con estado 401.

#### Scenario: Perfil sin credencial

- **WHEN** se solicita el perfil sin credencial de sesión
- **THEN** el sistema responde con estado 401 y un error con el mensaje `Unauthorized access`

#### Scenario: Perfil con credencial inválida

- **WHEN** se solicita el perfil con una credencial que el sistema no reconoce
- **THEN** el sistema responde con estado 401, igual que sin credencial

### Requirement: El perfil se obtiene con una sesión válida

El sistema SHALL devolver, a quien presente una credencial de sesión válida, los datos públicos de su propia cuenta: identificador, nombre (o vacío), email, fecha de creación y fecha de actualización. Las fechas SHALL expresarse en formato ISO 8601 con desfase horario (por ejemplo `2026-10-05T01:40:50.000+00:00`). La respuesta SHALL NOT incluir la contraseña.

#### Scenario: Perfil con credencial válida

- **WHEN** se solicita el perfil con la credencial de una sesión válida
- **THEN** el sistema responde con estado 200 y los datos de la cuenta de esa sesión
- **THEN** la fecha de creación está en formato ISO 8601 con desfase horario
- **THEN** la respuesta no contiene la contraseña

#### Scenario: Pantalla de perfil

- **WHEN** una persona con sesión válida abre la pantalla de perfil
- **THEN** la interfaz muestra su nombre (o "Sin nombre" si no tiene), su email y la fecha "Miembro desde" en español
- **THEN** ofrece la acción de cerrar sesión

### Requirement: Las pantallas de acceso solo están disponibles sin sesión

La interfaz SHALL mostrar las pantallas de inicio de sesión (`/login`) y de registro (`/register`) únicamente a quien no tiene sesión, y SHALL redirigir a la pantalla de perfil a quien ya la tiene.

#### Scenario: Persona sin sesión abre el login o el registro

- **WHEN** una persona sin sesión abre `/login` o `/register`
- **THEN** la interfaz muestra la pantalla solicitada

#### Scenario: Persona con sesión abre el login o el registro

- **WHEN** una persona con sesión válida abre `/login` o `/register`
- **THEN** la interfaz la redirige a `/profile`

### Requirement: El perfil está protegido en la interfaz

La interfaz SHALL mostrar la pantalla de perfil (`/profile`) únicamente a quien tiene una sesión válida, y SHALL redirigir a `/login` a quien no la tiene. Cualquier otra ruta SHALL redirigir a `/profile`, de modo que sin sesión se acaba en `/login`.

#### Scenario: Persona sin sesión abre el perfil

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** la interfaz la redirige a `/login`

#### Scenario: Ruta desconocida

- **WHEN** una persona abre una ruta que no existe, incluida la raíz `/`
- **THEN** la interfaz la redirige a `/profile`
- **THEN** si no tiene sesión, termina en `/login`

### Requirement: La sesión persiste en el cliente

La interfaz SHALL conservar la sesión iniciada en el navegador entre recargas de la página y SHALL comprobar con el servidor que la sesión sigue siendo válida antes de darla por buena. Mientras se realiza esa comprobación, la interfaz SHALL mostrar un indicador de carga y SHALL NOT redirigir.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión iniciada recarga la página en `/profile`
- **THEN** la interfaz muestra un indicador de carga mientras comprueba la sesión
- **THEN** después muestra la pantalla de perfil sin pasar por `/login`

#### Scenario: Recarga con una sesión que el servidor ya no reconoce

- **WHEN** una persona recarga la página y el servidor responde 401 a la comprobación de la sesión guardada
- **THEN** la interfaz descarta la sesión guardada y redirige a `/login`
- **THEN** muestra en la pantalla de inicio de sesión el mensaje "Tu sesión ha caducado. Vuelve a iniciar sesión."

### Requirement: Cerrar sesión finaliza la sesión en el cliente

La interfaz SHALL permitir cerrar sesión desde la pantalla de perfil. Al hacerlo, la persona SHALL dejar de estar autenticada en el cliente y SHALL ser llevada a `/login`, con independencia de que el servidor responda correctamente a la petición de cierre.

#### Scenario: Cierre de sesión

- **WHEN** una persona con sesión pulsa "Cerrar sesión" en el perfil
- **THEN** la interfaz elimina la sesión guardada en el navegador y la lleva a `/login`
- **THEN** si después abre `/profile`, la interfaz la redirige a `/login`

#### Scenario: Cierre de sesión con el servidor no disponible

- **WHEN** una persona pulsa "Cerrar sesión" y la petición al servidor falla
- **THEN** la interfaz igualmente la deja sin sesión y la lleva a `/login`

## Verificación

### Requirements escritos vs verificados

- Requirements escritos por el agente: 11.
- Requirements verificados personalmente por mí abriendo el código: 0.

La inspección detallada del código fue realizada por el agente durante el tiempo del ejercicio. Revisé los resultados obtenidos y el comportamiento de la aplicación, pero no alcancé a contrastar personalmente los Requirements abriendo el código antes de finalizar el tiempo disponible.

### Incoherencias encontradas

- El registro responde con estado 200 en lugar de 201.
- El email actualmente distingue mayúsculas y minúsculas, permitiendo cuentas que solo difieren en el casing.
- Un 401 se presenta en la interfaz como “Tu sesión ha caducado”, aunque la expiración de los tokens no quedó demostrada.
- El logout devuelve una respuesta sin el envoltorio `data` utilizado en otras respuestas y su mensaje está en inglés.
- La interfaz impide acceder a login y registro con una sesión activa, mientras el backend sigue aceptando esas operaciones.
- La precisión de los milisegundos de `createdAt` difiere entre la respuesta del registro y lecturas posteriores.
- La respuesta del perfil incluye una cookie de sesión aunque el flujo de autenticación observado utiliza una credencial bearer.

### Bug o contrato

- **Email sensible a mayúsculas y minúsculas**
  - Como contrato: el email podría estar diseñado como un identificador literal que conserva exactamente lo introducido.
  - Como bug: podría faltar normalización, permitiendo cuentas aparentemente duplicadas y provocando fallos de login al cambiar el casing.

- **Expiración de las sesiones**
  - Como contrato: las sesiones podrían estar diseñadas para ser persistentes.
  - Como bug: podría faltar una política de expiración de tokens.
  - La evidencia disponible no permite decidir entre ambas interpretaciones.

- **Logout cuando falla el servidor**
  - Como contrato: la interfaz podría estar diseñada para cerrar siempre la sesión local aunque el servidor no responda.
  - Como bug: el token podría seguir siendo válido en el servidor después de que el usuario crea haber cerrado sesión.