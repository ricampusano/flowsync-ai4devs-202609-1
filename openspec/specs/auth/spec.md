# auth Specification

## Purpose

Permitir que una persona cree una cuenta en FlowSync, inicie y cierre sesión y consulte su perfil, tanto a través de la API HTTP como de las pantallas de la aplicación web.

## Requirements

### Requirement: Registro de cuentas por API

El sistema SHALL permitir crear una cuenta mediante `POST /api/v1/auth/signup` con nombre completo (opcional, puede ser nulo), email, contraseña y confirmación de contraseña, y SHALL responder con el usuario creado y un token de acceso, ya con la sesión iniciada.

#### Scenario: Registro correcto

- **WHEN** se envía una petición de registro con un email no registrado, una contraseña de entre 8 y 32 caracteres y una confirmación idéntica
- **THEN** la respuesta es satisfactoria y su cuerpo `data` contiene el usuario (`id`, `fullName`, `email`, `createdAt`, `updatedAt`, `initials`) y un `token`, y el cuerpo no contiene la contraseña

#### Scenario: Registro sin nombre

- **WHEN** se envía una petición de registro válida con `fullName` igual a `null`
- **THEN** la cuenta se crea y el usuario devuelto tiene `fullName` nulo

### Requirement: Validación del registro

El sistema SHALL rechazar con estado 422 y una lista de errores por campo el registro que incumpla las reglas de los datos.

#### Scenario: Email ya registrado

- **WHEN** se envía un registro con un email que ya pertenece a otra cuenta
- **THEN** la respuesta es 422 con un error sobre el campo `email` de regla `database.unique`, y no se crea ninguna cuenta nueva

#### Scenario: Email con formato inválido o demasiado largo

- **WHEN** se envía un registro cuyo email no tiene formato de email o supera los 254 caracteres
- **THEN** la respuesta es 422 con un error sobre el campo `email`

#### Scenario: Contraseña fuera de longitud

- **WHEN** se envía un registro con una contraseña de menos de 8 o de más de 32 caracteres
- **THEN** la respuesta es 422 con un error sobre el campo `password`

#### Scenario: Confirmación distinta

- **WHEN** se envía un registro cuya `passwordConfirmation` no coincide con `password`
- **THEN** la respuesta es 422 con un error de regla `sameAs` sobre el campo `passwordConfirmation`

#### Scenario: Campos obligatorios ausentes

- **WHEN** se envía un registro sin alguno de los campos `fullName`, `email`, `password` o `passwordConfirmation`
- **THEN** la respuesta es 422 con un error de regla `required` por cada campo ausente

### Requirement: Inicio de sesión por API

El sistema SHALL permitir iniciar sesión mediante `POST /api/v1/auth/login` con email y contraseña, y SHALL responder con el usuario y un nuevo token de acceso.

#### Scenario: Credenciales correctas

- **WHEN** se envía un inicio de sesión con el email y la contraseña de una cuenta existente
- **THEN** la respuesta es satisfactoria y `data` contiene el usuario y un `token`

#### Scenario: Credenciales incorrectas

- **WHEN** se envía un inicio de sesión con un email inexistente o con una contraseña que no corresponde a la cuenta
- **THEN** la respuesta es 400 y no contiene ningún token

#### Scenario: Datos mal formados

- **WHEN** se envía un inicio de sesión sin email, sin contraseña o con un email que no tiene formato válido
- **THEN** la respuesta es 422 con un error por cada campo incorrecto

#### Scenario: Varias sesiones simultáneas

- **WHEN** una misma cuenta inicia sesión dos veces
- **THEN** cada inicio devuelve un token distinto y ambos permiten acceder al perfil

### Requirement: Consulta del perfil autenticado

El sistema SHALL devolver el perfil de la persona autenticada mediante `GET /api/v1/account/profile` cuando la petición lleve un token de acceso válido en la cabecera `Authorization: Bearer`.

#### Scenario: Token válido

- **WHEN** se solicita el perfil con el token obtenido al registrarse o iniciar sesión
- **THEN** la respuesta es satisfactoria y `data` contiene `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials` de esa persona

#### Scenario: Iniciales a partir del nombre

- **WHEN** el perfil pertenece a una cuenta con nombre completo de al menos dos palabras
- **THEN** `initials` son en mayúsculas la primera letra de la primera y de la segunda palabra del nombre

#### Scenario: Iniciales sin nombre o con una sola palabra

- **WHEN** el perfil pertenece a una cuenta sin nombre, o con un nombre de una sola palabra
- **THEN** `initials` son en mayúsculas las dos primeras letras de esa palabra (o, sin nombre, de la parte local del email)

### Requirement: Acceso restringido a usuarios autenticados

El sistema SHALL responder 401 a las peticiones de perfil y cierre de sesión que no lleven un token de acceso válido.

#### Scenario: Sin token

- **WHEN** se solicita el perfil sin cabecera `Authorization`
- **THEN** la respuesta es 401

#### Scenario: Token desconocido o ya revocado

- **WHEN** se solicita el perfil con un token que no existe o que fue invalidado al cerrar sesión
- **THEN** la respuesta es 401

### Requirement: Cierre de sesión por API

El sistema SHALL invalidar el token usado en la petición `POST /api/v1/account/logout`, sin afectar a los demás tokens de la misma cuenta.

#### Scenario: Cierre correcto

- **WHEN** una persona autenticada envía la petición de cierre de sesión
- **THEN** la respuesta es satisfactoria con el mensaje `Logged out successfully`, y ese token deja de permitir el acceso al perfil

#### Scenario: Otras sesiones intactas

- **WHEN** una cuenta con dos tokens cierra sesión con uno de ellos
- **THEN** el otro token sigue permitiendo el acceso al perfil

### Requirement: Formato de las respuestas de la API

El sistema SHALL devolver siempre JSON en las rutas de autenticación, envolviendo las respuestas satisfactorias bajo la clave `data`.

#### Scenario: Cliente que no pide JSON

- **WHEN** se invoca cualquier ruta de autenticación sin cabecera `Accept: application/json`
- **THEN** la respuesta, incluidos los errores, es JSON

### Requirement: Pantalla de registro

La aplicación SHALL ofrecer en `/register` un formulario con los campos «Nombre completo» (opcional), «Email», «Contraseña» (con la indicación «Entre 8 y 32 caracteres.») y «Repite la contraseña», y un botón «Crear cuenta».

#### Scenario: Registro correcto

- **WHEN** una persona sin sesión rellena el formulario con datos válidos y pulsa «Crear cuenta»
- **THEN** el botón muestra «Creando cuenta…» mientras espera, y la persona queda con la sesión iniciada y ve su pantalla de perfil

#### Scenario: Nombre en blanco

- **WHEN** la persona deja el nombre vacío o solo con espacios
- **THEN** la cuenta se crea sin nombre y el perfil muestra «Sin nombre»

#### Scenario: Contraseñas distintas

- **WHEN** la persona pulsa «Crear cuenta» con contraseña y confirmación diferentes
- **THEN** aparece bajo «Repite la contraseña» el mensaje «Las contraseñas no coinciden.», y no se envía nada al servidor

#### Scenario: Email ya registrado

- **WHEN** el servidor rechaza el registro porque el email ya existe
- **THEN** aparece bajo «Email» el mensaje «Ese email ya está registrado. Inicia sesión en su lugar.»

#### Scenario: Otros errores de validación

- **WHEN** el servidor rechaza el registro por la longitud de la contraseña o por el formato del email
- **THEN** el mensaje en castellano correspondiente aparece bajo el campo afectado

#### Scenario: Enlace al inicio de sesión

- **WHEN** la persona pulsa «Inicia sesión» en el pie del formulario
- **THEN** pasa a la pantalla de inicio de sesión

### Requirement: Pantalla de inicio de sesión

La aplicación SHALL ofrecer en `/login` un formulario con «Email» y «Contraseña» y un botón «Entrar».

#### Scenario: Inicio correcto

- **WHEN** una persona sin sesión introduce credenciales correctas y pulsa «Entrar»
- **THEN** el botón muestra «Entrando…» mientras espera, y la persona queda con la sesión iniciada y ve su pantalla de perfil

#### Scenario: Credenciales incorrectas

- **WHEN** el servidor rechaza las credenciales
- **THEN** aparece una alerta con el mensaje «El email o la contraseña no son correctos.», y la persona permanece en la pantalla de inicio de sesión

#### Scenario: Servidor inalcanzable

- **WHEN** no se puede conectar con el servidor al enviar el formulario
- **THEN** aparece una alerta indicando que no se pudo conectar con el servidor

#### Scenario: Enlace al registro

- **WHEN** la persona pulsa «Crea una» en el pie del formulario
- **THEN** pasa a la pantalla de registro

### Requirement: Pantalla de perfil

La aplicación SHALL mostrar en `/profile` a la persona con sesión su avatar con las iniciales, su nombre (o «Sin nombre»), su email y la fecha «Miembro desde» en formato largo en castellano, junto con un botón «Cerrar sesión».

#### Scenario: Datos del perfil

- **WHEN** una persona con sesión abre su perfil
- **THEN** ve sus iniciales, su nombre o «Sin nombre», su email y la fecha de alta, por ejemplo «9 de octubre de 2026»

#### Scenario: Cierre de sesión

- **WHEN** la persona pulsa «Cerrar sesión»
- **THEN** el botón muestra «Cerrando sesión…» y la persona pasa a la pantalla de inicio de sesión sin sesión activa

#### Scenario: Cierre aunque el servidor falle

- **WHEN** la persona pulsa «Cerrar sesión» y el servidor no responde o rechaza la petición
- **THEN** la persona igualmente pasa a la pantalla de inicio de sesión sin sesión activa

### Requirement: Protección de rutas según la sesión

La aplicación SHALL mostrar el perfil solo a quien tiene sesión, y las pantallas de registro e inicio de sesión solo a quien no la tiene; cualquier otra dirección SHALL llevar al perfil.

#### Scenario: Perfil sin sesión

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** es llevada a `/login`

#### Scenario: Acceso o registro con sesión

- **WHEN** una persona con sesión abre `/login` o `/register`
- **THEN** es llevada a `/profile`

#### Scenario: Dirección desconocida

- **WHEN** una persona abre una dirección que no existe en la aplicación
- **THEN** es llevada a `/profile` y, si no tiene sesión, de ahí a `/login`

#### Scenario: Comprobación en curso

- **WHEN** la aplicación está verificando una sesión guardada al cargar
- **THEN** se muestra un indicador de carga a pantalla completa y no se redirige a ninguna parte hasta saber el resultado

### Requirement: Persistencia de la sesión entre cargas

La aplicación SHALL conservar la sesión al recargar la página o al volver a abrirla en el mismo navegador, siempre que el servidor siga reconociendo la sesión guardada.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión recarga la página
- **THEN** sigue viendo su perfil sin volver a introducir credenciales

#### Scenario: Sesión caducada o revocada

- **WHEN** al cargar, el servidor rechaza la sesión guardada
- **THEN** la persona es llevada a `/login` y ve la alerta «Tu sesión ha caducado. Vuelve a iniciar sesión.», y la sesión guardada se descarta

#### Scenario: Servidor caído al recargar

- **WHEN** al cargar, el servidor no está disponible o responde con un error distinto de 401
- **THEN** la persona es llevada a `/login` con una alerta que explica el fallo, y la sesión guardada se conserva, de modo que una recarga posterior con el servidor disponible la restaura

#### Scenario: Aviso borrado al volver a entrar

- **WHEN** la persona inicia sesión correctamente tras haber visto un aviso de sesión perdida
- **THEN** el aviso deja de mostrarse
