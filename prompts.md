# Prompts del Laboratorio 4: verificación y trazabilidad

Registro de los prompts enviados en la sesión de Claude Code del Laboratorio 4 (AI4Devs), en orden cronológico.

- **Herramienta:** Claude Code (CLI).
- **Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`), según el resumen de contexto de la propia sesión.
- **Fecha de la sesión:** 2026-10-12, según el entorno. No se dispone de marcas de hora por prompt.
- **Rama de trabajo:** `trazabilidad-rc`.

Criterios del registro:

- Cada prompt se transcribe literalmente, tal como llegó a la sesión. Se omiten solo las etiquetas técnicas de pegado.
- Los resultados son factuales y describen lo que ocurrió en la sesión.
- No se incluyen como prompts las salidas del asistente, los permisos de herramientas ni los comandos internos `/login` y `/context`.
- Todos los prompts siguientes son recuperables literalmente. Ninguno consta como no recuperable.

---

## Prompt 1. Análisis y planificación

**Tipo:** análisis y planificación (modo plan, sin modificar archivos).

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
Estamos realizando el Laboratorio Práctico 4 del curso AI4Devs sobre verificación y trazabilidad de requisitos.

## Contexto
Trabajas en el repositorio FlowSync. Utiliza la especificación del proyecto como fuente de verdad y respeta las instrucciones persistentes aplicables del repositorio.

## Objetivo
Analiza exclusivamente el requisito **«Lo que cada tarea muestra de su responsable»**, ubicado en `openspec/specs/tasks/spec.md`.

Determina qué escenarios están realmente cubiertos por pruebas automatizadas y propone un plan mínimo para implementar las pruebas faltantes.

## Criterios de éxito
1. Identifica los escenarios exactos del requisito.
2. Inspecciona los tests existentes en `backend/tests/`.
3. Distingue cobertura real de similitud entre nombres de pruebas.
4. Justifica la cobertura examinando las aserciones.
5. Propone un test funcional por cada escenario sin cobertura, siguiendo los patrones existentes del proyecto.
6. Identifica los archivos que sería necesario crear o modificar.
7. Explica cómo verificarías los resultados.

## Restricciones
- Trabaja únicamente dentro de este repositorio.
- No modifiques ningún archivo durante esta fase.
- No implementes código todavía.
- No cambies la especificación ni el código de producción.
- No corrijas posibles defectos del backend.
- No adaptes los tests para conseguir resultados verdes.
- No analices otros requisitos de tareas fuera del alcance indicado.
- No presupongas que un comportamiento está cubierto sin verificar sus aserciones.

## Resultado esperado
Entrega un plan breve que incluya los escenarios, su cobertura inicial, las pruebas necesarias y la estrategia de verificación.

Si encuentras ambigüedades de la especificación, identifícalas sin inventar reglas. No ejecutes el plan hasta que lo apruebe expresamente.
````

**Resultado:**

- Se leyeron la especificación, los tests de `backend/tests/` y los transformers, controladores y rutas de tareas, solo con comandos de lectura.
- Se identificaron tres escenarios (E1 responsable identificable, E2 la tarea no filtra datos de cuenta, E3 responsable sin nombre) y una cobertura inicial de 0/3.
- Se escribió un plan en un fichero fuera del repositorio.
- Al presentarlo para aprobación, el usuario lo rechazó e interrumpió. Necesitó ajustes (ver prompt 2).

## Prompt 2. Ajustes del plan (primera revisión)

**Tipo:** revisión del plan.

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
El plan identifica correctamente los tres escenarios y la cobertura inicial de 0/3. Antes de aprobarlo, realiza estos ajustes:

1. Mantén un test funcional por cada escenario sin cobertura: tres tests en total, dentro de `backend/tests/functional/tasks/assignee.spec.ts`.
2. Para E2, verifica dentro de un mismo test que `assignee` no exponga `email`, `createdAt` ni `updatedAt` en las respuestas de creación, listado y consulta individual de tareas. No asumas que `assignee.id` está prohibido: consérvalo como ambigüedad de la especificación.
3. Para E3, comprueba explícitamente que `fullName` sea `null` y que `initials` esté presente. Si verificas su valor exacto, justifica su origen.
4. Elimina la propuesta de mutar temporalmente el código de producción. No está autorizada.
5. Incluye en el plan los otros entregables oficiales: `docs/verificacion/rc.md` con matriz de cuatro columnas y tres líneas de reflexión inmediatamente debajo, y `prompts.md` con los prompts reales, modelo, herramienta y resultados.
6. Diferencia claramente cobertura de tests y cumplimiento del requisito: un escenario puede tener test y presentar un fallo.
7. Mantén como restricción absoluta no modificar código de producción ni debilitar pruebas para obtener resultados verdes.

Actualiza únicamente el plan. No crees ni modifiques archivos del repositorio todavía. Espera mi aprobación.
````

**Resultado:**

- Se reescribió el plan incorporando los siete ajustes.
- Se retiró la propuesta de mutar producción.
- Se añadió la separación entre cobertura y cumplimiento.
- Se añadieron `rc.md` y `prompts.md` como entregables.
- Al presentar el plan de nuevo, el usuario lo rechazó otra vez y pidió dos correcciones más (ver prompt 3).

## Prompt 3. Ajustes del plan (segunda revisión) y aprobación

**Tipo:** revisión del plan.

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
El plan está prácticamente aprobado. Corrige únicamente estos dos puntos antes de implementarlo:

1. La matriz `docs/verificacion/rc.md` debe respetar exactamente las cuatro columnas del ejercicio oficial:
   - Escenario
   - Test que lo cubre (nombre exacto)
   - Estado: Cubierto / No cubierto / No lo sé
   - Qué faltó para decidir, cuando corresponda

   No sustituyas las columnas oficiales por «Resultado del test» o «Cumplimiento del requisito». La diferencia entre cobertura y cumplimiento puede documentarse después de las tres líneas de la Parte B, en una sección breve de evidencia.

2. No ejecutes todavía operaciones de Git ni GitHub que publiquen o confirmen cambios: commit, push o creación del Pull Request. Tampoco invoques por ahora al subagente adversarial-reviewer. Esas actividades se realizarán posteriormente, una vez que hayamos revisado los archivos, la matriz y los resultados de los tests.

Conserva todos los demás aspectos del plan: tres tests, cobertura inicial 0/3, comprobaciones de privacidad en creación/listado/detalle, preservación de tests fallidos y prohibición de modificar producción.

Actualiza solamente el plan y espera mi aprobación. No modifiques todavía archivos del repositorio.
````

**Resultado:**

- Se actualizó el plan con las cuatro columnas oficiales y la sección de evidencia posterior a las tres líneas.
- Se excluyeron commit, push, Pull Request y el subagente `adversarial-reviewer` de esta fase.
- El usuario aprobó el plan.
- Tras la aprobación, un comando de shell combinado (crear directorio, escribir el test con heredoc, formatear y ejecutar) fue **rechazado** por el usuario, con la advertencia «Contains brace with quote character (expansion obfuscation)». El comando no llegó a ejecutarse.

## Prompt 4. Auditoría del comando rechazado

**Tipo:** revisión / auditoría de lo ocurrido (sin ejecutar nada).

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
La ejecución se interrumpió porque rechacé una autorización que mostraba la advertencia «Contains brace with quote character (expansion obfuscation)».

Antes de continuar:

1. Indica cuáles fueron los dos comandos que alcanzaste a ejecutar y sus resultados.
2. Muestra el comando exacto que intentabas ejecutar cuando apareció la advertencia.
3. Explica para qué servía ese comando y qué archivos podía modificar.
4. Informa qué archivos del repositorio has creado o modificado hasta este momento.

No ejecutes comandos adicionales ni modifiques archivos para responder. Utiliza únicamente la información que ya tienes disponible en esta sesión.

Después de responder, espera mis instrucciones. Mantendremos la aprobación manual.
````

**Resultado:**

- Se informó de que desde la aprobación del plan solo se había ejecutado **un** comando, de solo lectura (consulta del esquema de `Task`), y no dos como suponía el prompt.
- Se mostró el comando rechazado: `mkdir -p`, escritura del test con heredoc, `prettier --write` y `node ace test functional --files=assignee` en una sola llamada.
- Se informó de que el comando rechazado contenía **cuatro** tests y no los tres aprobados.
- Se informó de que ningún archivo del repositorio había sido creado ni modificado.

## Prompt 5. Creación del archivo de tests

**Tipo:** creación de tests (una única operación de escritura).

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
Continúa con el plan aprobado, pero realiza únicamente esta operación:

Crea `backend/tests/functional/tasks/assignee.spec.ts` utilizando la herramienta de edición de archivos de Claude Code, con exactamente tres tests funcionales, uno por cada escenario E1, E2 y E3.

Requisitos:
- E1: verificar nombre completo e iniciales de Ada Lovelace.
- E2: verificar que `assignee` no exponga `email`, `createdAt` ni `updatedAt` en creación, listado y consulta individual. Recopila las infracciones antes de la aserción final para identificar todos los endpoints afectados.
- E3: verificar que `fullName` esté presente con valor `null` y que `initials` exista y no esté vacío.
- Sigue las convenciones de los tests funcionales existentes.
- No modifiques ningún otro archivo.
- No ejecutes comandos de shell, formateadores ni tests.
- No crees un cuarto test.
- No ejecutes Git ni GitHub.

Después de crear el archivo, detente e informa qué hiciste. Espera mi autorización antes de continuar.
````

**Resultado:**

- Se creó `backend/tests/functional/tasks/assignee.spec.ts` con tres tests, uno por escenario.
- Los tres tests se escribieron a mano sin formateador y no se ejecutó ningún comando.
- E2 recoge las infracciones por endpoint antes de la aserción final.

## Prompt 6. Ejecución de los tests

**Tipo:** ejecución de pruebas.

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
Ejecuta únicamente los tres tests de `backend/tests/functional/tasks/assignee.spec.ts`.

Antes de ejecutarlos, identifica el comando de pruebas apropiado según la configuración real del proyecto.

No modifiques ni formatees archivos. No corrijas el código de producción ni alteres las aserciones para obtener resultados verdes.

Ejecuta las pruebas desde `backend/` y reporta:

1. Comando exacto ejecutado.
2. Número de tests aprobados y fallidos.
3. Resultado de cada escenario E1, E2 y E3.
4. Mensaje completo de cualquier fallo relevante.
5. Archivos modificados o generados durante la ejecución, si los detectas.

Si un test falla, conserva el fallo y detente para que podamos analizarlo antes de continuar.

No ejecutes commit, push ni Pull Request.
````

**Resultado:**

- Comando: `node ace test functional --files=assignee`, desde `backend/`. El script `npm test` es `node ace test`.
- Resultado: 3 tests, **2 aprobados y 1 fallido**. E1 PASS, E2 FAIL, E3 PASS.
- E2 detectó seis infracciones: `assignee.email`, `assignee.createdAt` y `assignee.updatedAt` en `POST /tasks` y en `GET /tasks`. `GET /tasks/:id` no presentó infracciones.
- `git status` solo mostró el directorio nuevo `tests/functional/tasks/`. El log indicó `codegen: created 5 file(s)` sin cambios visibles en Git.
- El fallo se conservó, sin tocar producción ni las aserciones.

## Prompt 7. Comprobación previa a los entregables documentales

**Tipo:** preparación de documentación (verificación, sin crear archivos).

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
Vamos a preparar los entregables documentales del Laboratorio 4, pero antes de crear archivos realiza únicamente una comprobación.

1. Enumera los prompts que realmente te envié durante esta sesión, en orden, indicando si dispones de su texto literal completo o solo de un resumen.
2. Confirma que puedes distinguir los prompts del usuario de las respuestas y planes generados por ti.
3. Resume los resultados verificados de los tres tests: E1 PASS, E2 FAIL y E3 PASS, incluyendo las seis infracciones detectadas en E2.
4. Confirma que comprendes el formato oficial de la matriz: cuatro columnas (Escenario, Test exacto, Estado, Qué faltó para decidir) y tres líneas de reflexión inmediatamente debajo.
5. Para la primera línea de la Parte B, registra que mi estimación de referencia fue 1/3, formulada después de una inspección previa, mientras que la cobertura inicial verificada fue 0/3. No presentes la estimación como una predicción independiente anterior a la investigación.

No crees ni modifiques archivos todavía. No ejecutes comandos. Si no tienes el texto literal completo de algún prompt, indícalo expresamente y espera a que te lo proporcione.

Detente después de responder.
````

**Resultado:**

- Se enumeraron los siete prompts disponibles hasta ese momento, todos con texto literal completo.
- Se resumieron los resultados de los tests.
- Se registró la estimación 1/3 como formulada tras una inspección previa, frente al 0/3 verificado.
- Se señaló que faltaba el enunciado oficial de las líneas 2 y 3 de la Parte B.
- No se crearon ni modificaron archivos.

## Prompt 8. Contenido oficial de la Parte B

**Tipo:** preparación de documentación (aportación de información).

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
Te proporciono el contenido oficial que faltaba del apartado «Parte B: las tres líneas» del ejercicio AI4Devs.

El ejercicio exige tres líneas, inmediatamente debajo de la matriz, redactadas de forma concreta:

1. Cuántos escenarios creía cubiertos antes de mirar y cuántos estaban realmente cubiertos. En este laboratorio, mi estimación de referencia es 1/3, formulada después de una inspección previa, y la cobertura inicial verificada es 0/3. Conserva explícitamente esta limitación metodológica.

2. Identificar el escenario en el que no quedó claro si faltaba un test o faltaba una regla en la especificación, indicando qué generó la duda. En nuestro caso, utiliza E2: no está claro si `assignee.id` está permitido, porque el requisito menciona nombre e iniciales y prohíbe otros datos de cuenta.

3. Identificar algo que el escenario no determinaba y que fue necesario decidir al escribir el test. En nuestro caso, para E2 decidimos comprobar los campos `email`, `createdAt` y `updatedAt` en creación, listado y consulta individual de tareas.

Las tres reflexiones deben redactarse en primera persona, con una línea por punto.

Antes de crear los archivos, confirma que comprendes estos tres requisitos y explica brevemente cómo los incorporarás en `docs/verificacion/rc.md`.

No ejecutes comandos ni modifiques archivos todavía. Espera mi autorización.
````

**Resultado:**

- Se confirmó la comprensión de los tres requisitos.
- Se presentó la estructura prevista de `rc.md` y un borrador de las tres líneas.
- Se planteó una decisión abierta: la matriz podía reflejar el estado inicial (opción B) o el estado tras escribir los tests (opción A, recomendada).
- No se crearon ni modificaron archivos.

## Prompt 9. Creación de la matriz

**Tipo:** preparación de documentación (creación de `docs/verificacion/rc.md`).

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
Apruebo la opción A: la matriz debe reflejar el estado final después de crear los tests.

Crea únicamente `docs/verificacion/rc.md` con las siguientes condiciones:

1. Utiliza exactamente las cuatro columnas oficiales: Escenario, Test que lo cubre, Estado y Qué faltó para decidir.
2. Incluye tres filas, una por cada escenario E1, E2 y E3.
3. Utiliza los nombres literales de los tres tests de `assignee.spec.ts`.
4. Marca los tres escenarios como «Cubierto», ya que existen tests con aserciones verificadas, aunque E2 falle.
5. En la cuarta columna utiliza `—` para los tres escenarios, pues no existe incertidumbre sobre su cobertura. Registra las ambigüedades del contrato en la reflexión.
6. Coloca inmediatamente debajo de la matriz las tres líneas de la Parte B, en primera persona, siguiendo el borrador que acabamos de revisar.
7. Después incorpora una sección breve de evidencia: cobertura inicial 0/3, cobertura final 3/3, ejecución de tres tests con 2 PASS y 1 FAIL, y las seis infracciones detectadas en E2.
8. Distingue claramente cobertura de tests y cumplimiento del requisito.
9. No presentes hipótesis técnicas como hechos confirmados.

No modifiques `assignee.spec.ts`, código de producción ni ningún otro archivo. No ejecutes comandos, tests, formateadores ni operaciones Git/GitHub.

Después de crear `rc.md`, detente y espera mi revisión.
````

**Resultado:**

- Se creó `docs/verificacion/rc.md`:
  - matriz de cuatro columnas con los tres tests literales y `Cubierto` en las tres filas;
  - tres líneas de la Parte B justo debajo;
  - sección de evidencia con 0/3 inicial y 3/3 final, 2 PASS y 1 FAIL, y las seis infracciones;
  - separación entre cobertura y cumplimiento;
  - causa técnica presentada solo como hipótesis no confirmada.
- No se modificó ningún otro archivo.

## Prompt 10. Creación de este registro

**Tipo:** preparación de documentación (creación de `prompts.md`).

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
Crea únicamente `prompts.md` en la raíz del repositorio FlowSync, como entregable oficial del Laboratorio 4.

Requisitos:

1. Recupera de esta sesión todos los prompts reales que te envié, en orden cronológico, desde el primer prompt de análisis y planificación hasta esta instrucción.
2. Transcribe cada prompt literalmente, sin resumirlo, corregirlo ni reconstruirlo.
3. Identifica en cada registro la herramienta Claude Code y el modelo realmente utilizado, según la información disponible en la sesión.
4. Incluye un resultado breve y factual para cada prompt, distinguiendo los planes, las revisiones, el comando rechazado, la creación de tests, la ejecución de pruebas y la preparación de documentación.
5. Registra también los prompts que no funcionaron o necesitaron ajustes.
6. Si algún prompt ya no está disponible literalmente, indícalo como no recuperable; no inventes su contenido.
7. No incluyas como prompts las salidas generadas por ti, los permisos de herramientas ni los comandos internos `/login` o `/context`.
8. No inventes fechas, resultados ni operaciones.

Crea exclusivamente `prompts.md`. No modifiques otros archivos, no ejecutes comandos, formateadores, tests ni operaciones Git/GitHub.

Después de escribir el archivo, detente para que podamos revisar su contenido completo antes de continuar.
````

**Resultado:**

- Se actualizó la plantilla existente de `prompts.md`, en la raíz del repositorio, sustituyendo el ejemplo por los prompts reales. No se creó un archivo nuevo.
- No se modificó ningún otro archivo ni se ejecutó ningún comando.

## Prompt 11. Corrección de modelo, herramienta y resultado del Prompt 10

**Tipo:** preparación de documentación (corrección de `prompts.md`).

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
He revisado `prompts.md` y el contenido está aprobado en términos generales. Necesito dos correcciones para cumplir exactamente la plantilla oficial.

1. En cada uno de los diez apartados `## Prompt N`, incorpora explícitamente:
   - **Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`), según la información registrada de esta sesión.
   - **Herramienta:** Claude Code (CLI).

   Conserva también la información general de la cabecera.

2. Corrige el resultado del Prompt 10. El archivo `prompts.md` ya existía como plantilla oficial del curso; fue actualizado para sustituir el ejemplo por los prompts reales. No fue creado desde cero.

No modifiques los textos literales de ninguno de los diez prompts, ni sus resultados restantes.

Registra esta instrucción como Prompt 11, literalmente y con su resultado real, siguiendo la misma estructura. Si necesitas incorporar el resultado de la propia actualización, descríbelo únicamente según las acciones efectivamente realizadas.

Modifica exclusivamente `prompts.md`. No ejecutes comandos, tests, formateadores ni operaciones Git/GitHub.

Después de actualizarlo, detente para revisión.
````

**Resultado:**

- El asistente intentó aplicar los cambios con doce ediciones sucesivas sobre `prompts.md`.
- Solo se aplicaron las dos primeras, que añadieron **Modelo** y **Herramienta** a los Prompts 1 y 2.
- Las otras diez ediciones fueron rechazadas por el usuario en la autorización y no se aplicaron: los apartados de los Prompts 3 al 10, la corrección del resultado del Prompt 10, el registro de este Prompt 11 y una fila adicional en la tabla de ajustes.
- Por tanto, tras este prompt el archivo quedó con autorizaciones parciales: Modelo y Herramienta en los Prompts 1 y 2 y no en los demás, y con el resultado del Prompt 10 sin corregir.
- No se modificó ningún otro archivo ni se ejecutó ningún comando.

## Prompt 12. Actualización consolidada de este registro

**Tipo:** preparación de documentación (actualización consolidada de `prompts.md`).

**Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)

**Herramienta:** Claude Code (CLI)

````text
Necesitamos cerrar el Laboratorio 4. Realiza una única actualización consolidada de `prompts.md`.

El archivo contiene actualmente 10 prompts. Los prompts 1 y 2 ya tienen Modelo y Herramienta; los prompts 3 al 10 todavía no.

Haz exclusivamente lo siguiente:

1. Añade a cada apartado de los prompts 3 al 10:
   **Modelo:** Claude Sonnet 5.5 (`claude-sonnet-5-5`)
   **Herramienta:** Claude Code (CLI)
2. Corrige el resultado del Prompt 10 para indicar que se actualizó la plantilla existente de `prompts.md`, no que se creó un archivo nuevo.
3. Incorpora como Prompt 11 el texto literal de la instrucción anterior que te envié para corregir el modelo, la herramienta y el resultado del Prompt 10. Conserva sus metadatos y explica brevemente que hubo autorizaciones parciales y ediciones rechazadas.
4. Registra también este mensaje como Prompt 12, con su texto literal, modelo y herramienta.

No alteres los textos originales de los primeros diez prompts ni modifiques ningún otro archivo.

IMPORTANTE: realiza la actualización mediante una única operación de escritura del archivo completo, no mediante múltiples operaciones Update. Si no puedes hacerlo en una sola operación, informa del impedimento y detente.

No ejecutes tests, formateadores, comandos de shell ni operaciones Git/GitHub. Detente cuando termine la escritura.
````

**Resultado:**

- Se leyó `prompts.md` para comprobar su estado actual (los Prompts 1 y 2 con Modelo y Herramienta, los demás sin ellos) y a continuación se reescribió el archivo completo con una única operación de escritura.
- Se añadieron **Modelo** y **Herramienta** a los Prompts 3 al 10.
- Se corrigió el resultado del Prompt 10: se actualizó la plantilla existente, no se creó un archivo nuevo.
- Se registraron los Prompts 11 y 12.
- No se modificó ningún otro archivo ni se ejecutó ningún comando, test, formateador ni operación Git/GitHub.

---

## Prompts que no funcionaron o necesitaron ajustes

| Prompt | Qué ocurrió | Ajuste |
|---|---|---|
| 1 | El plan resultante fue rechazado por el usuario al presentarlo para aprobación. Incluía una propuesta de mutar temporalmente producción, no autorizada. | Prompt 2. |
| 2 | El plan actualizado fue rechazado de nuevo: las columnas de la matriz no eran las oficiales y faltaba excluir Git/GitHub. | Prompt 3. |
| 3 (aprobación) | Tras la aprobación, un comando combinado (crear directorio, escribir el test, formatear y ejecutar) fue rechazado por el usuario con la advertencia «Contains brace with quote character (expansion obfuscation)». El comando incluía además un cuarto test no aprobado. Esto no fue un fallo del prompt del usuario, sino de la acción del asistente. | Prompts 4 y 5: se pidió auditar lo ocurrido y repetir la operación en pasos separados, con tres tests. |
| 4 | El prompt suponía que se habían ejecutado dos comandos; en realidad solo se había ejecutado uno. | Se corrigió en la respuesta, sin necesidad de reformular el prompt. |
| 6 | El test E2 falló, como se pedía conservar. Es un resultado del requisito, no un fallo del prompt. | Se conservó el fallo y se documentó en `rc.md`. |

## Elementos de la sesión no incluidos como prompts

- Los comandos internos `/context` y `/login`.
- Las decisiones de permiso sobre herramientas: los rechazos de las llamadas y la aprobación del plan.
- Un mensaje «Tool loaded.» de aspecto automático que apareció tras cargar una herramienta.
- Las salidas, planes y respuestas generados por el asistente.
