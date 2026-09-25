---
name: priority-ticket
description: Selecciona automáticamente el ticket de Jira de mayor prioridad asignado al usuario actual en estado "Por hacer", resume sus criterios de aceptación, entra en Plan Mode para proponer una implementación alineada con AGENTS.md/CLAUDE.md, y gestiona el ciclo de vida del ticket en Jira (transición a "En curso" al aprobar el plan; transición a "En revisión" + comentario con el enlace del PR al terminar). Úsala cuando el usuario pida cosas como "¿qué hago ahora?", "dame mi próximo ticket", "toma el más prioritario de mi backlog", "empieza con mi siguiente tarea de Jira", "trabaja en el ticket más urgente que tengo asignado", o cualquier variante donde quiera delegar en el agente la elección y el arranque de trabajo a partir de Jira, incluso si no menciona la palabra "skill" o "Jira" explícitamente pero el contexto es claramente de gestión de tareas en equipo con Jira conectado.
---

# priority-ticket

Automatiza el arranque de una tarea: elige el ticket correcto, entiende qué pide, planea cómo resolverlo respetando las convenciones del repo, y mantiene Jira sincronizado con el estado real del trabajo (en curso / en revisión) sin que el usuario tenga que ir y volver a la UI de Jira para cada cambio de estado.

## Por qué el orden de los pasos importa

Jira es la fuente de verdad de en qué estado está el trabajo del equipo. Si el agente empieza a codear antes de mover el ticket a "En curso", o abre el PR sin dejar rastro en Jira, el resto del equipo pierde visibilidad — por eso cada transición de estado ocurre pegada al evento real que la justifica (aprobación del plan, apertura del PR), ni antes ni después.

## Flujo

### 1. Identificar al usuario y buscar candidatos

Usa `atlassianUserInfo` para confirmar la identidad del usuario autenticado en el MCP (email, accountId). Con eso, busca con `searchJiraIssuesUsingJql` los tickets asignados a ese usuario en estado "Por hacer":

```
assignee = currentUser() AND status = "Por hacer" ORDER BY priority DESC, created ASC
```

`currentUser()` ya resuelve al usuario autenticado en el MCP, así que normalmente no hace falta el accountId explícito — pero si la búsqueda con `currentUser()` no devuelve resultados esperados, usa `lookupJiraAccountId` para obtener el accountId exacto y sustitúyelo en el JQL (`assignee = "<accountId>"`).

El nombre exacto del estado ("Por hacer") puede variar según cómo esté configurado el proyecto (podría ser "To Do", "Pendiente", etc.). Si la query no devuelve nada y sospechas que es un problema de nomenclatura y no de que realmente no haya tickets, revisa los estados disponibles del proyecto (por ejemplo mirando las transiciones de un ticket cualquiera del proyecto) antes de concluir que no hay trabajo pendiente.

**Si no hay ningún ticket en ese estado asignado al usuario, dilo claramente y detente ahí.** No inventes trabajo ni elijas un ticket en otro estado sin que el usuario lo pida explícitamente.

### 2. Elegir el de mayor prioridad

De los resultados, selecciona el de prioridad más alta según el campo `priority` de Jira. Si hay empate, gana el creado primero (más antiguo). Muestra brevemente al usuario cuál elegiste y por qué (prioridad, y los que quedaron descartados si hay más de uno o dos), para que pueda redirigirte a otro ticket antes de seguir si no está de acuerdo con la selección — la prioridad en Jira no siempre refleja lo que el usuario quiere atacar hoy.

### 3. Resumir criterios de aceptación

Trae el detalle completo del ticket elegido con `getJiraIssue` y resume para el usuario, en pocas líneas:
- Título y contexto en una frase.
- Los criterios de aceptación tal como están en la descripción del ticket (si están en una lista, consérvala como lista; no los reformules tanto que pierdan precisión — son el contrato de "cuándo está terminado").

Este resumen es el punto de chequeo natural para que el usuario confirme que efectivamente es el ticket correcto antes de que el agente invierta tiempo planeando.

### 4. Entrar en Plan Mode con un plan basado en las convenciones del repo

Antes de proponer nada, lee `AGENTS.md` o `CLAUDE.md` (el que exista) en el directorio de trabajo — ahí está documentado cómo está organizado el proyecto, las convenciones de imports, comandos de test/lint, y la arquitectura de cada parte del repo. El plan que propongas en Plan Mode debe **referenciar explícitamente** esas convenciones (por ejemplo: qué carpeta/capa corresponde tocar según la arquitectura descrita, qué comando de test correr para verificar, qué patrón de imports seguir), no un plan genérico que ignore el contexto del proyecto.

Usa la herramienta de Plan Mode para presentar el plan y esperar aprobación del usuario. Si el usuario pide cambios al plan, itera sobre él ahí mismo — la transición de Jira del siguiente paso solo ocurre una vez que el plan quede aprobado.

### 5. Al aprobarse el plan: mover el ticket a "En curso"

Una vez el usuario aprueba el plan (sale de Plan Mode), antes de empezar a implementar:

1. Llama a `getTransitionsForJiraIssue` sobre el ticket para obtener las transiciones disponibles **en ese momento, para ese ticket** — los nombres e IDs de transición son específicos de cada proyecto/workflow de Jira, así que nunca asumas un ID fijo ni que el nombre es literalmente "En curso".
2. De esa lista, identifica la transición cuyo nombre corresponda a "en curso" / "in progress" (comparación flexible: puede venir en inglés, español, con mayúsculas distintas, etc.).
3. Ejecuta `transitionJiraIssue` con el ID de esa transición.

Si ninguna transición disponible parece corresponder a "en progreso", muéstrale al usuario las transiciones disponibles tal cual las devolvió Jira y pregúntale cuál usar, en vez de adivinar.

### 6. Implementar el plan aprobado

Esto es el flujo normal de trabajo del agente: implementa siguiendo el plan aprobado en el paso 4, corriendo los tests/lint que correspondan según lo documentado en AGENTS.md/CLAUDE.md. No hace falta un procedimiento especial aquí más allá de mantenerse fiel al plan aprobado (y volver a pasar por el usuario si en el camino aparece algo que cambia sustancialmente el plan).

### 7. Al crear el pull request: mover el ticket a "En revisión" y enlazarlo

Cuando el PR ya existe (creado por el usuario o por el propio agente, p. ej. vía `gh pr create`):

1. Repite el mismo patrón del paso 5 con `getTransitionsForJiraIssue` / `transitionJiraIssue`, esta vez buscando la transición que corresponda a "en revisión" / "in review".
2. Añade un comentario al ticket con `addCommentToJiraIssue` que incluya el enlace del PR, para que cualquiera que abra el ticket en Jira pueda llegar directo al PR sin tener que preguntar.

## Notas importantes

- **Nunca hardcodees IDs de transición ni asumas nombres de estado exactos.** Cada proyecto de Jira puede tener su propio workflow; `getTransitionsForJiraIssue` es siempre la fuente de verdad para lo que está disponible en ese momento para ese ticket.
- **El usuario manda sobre la selección del ticket.** Si hay ambigüedad en la prioridad, o el usuario prefiere otro ticket de la lista, cambia de ticket antes de entrar en Plan Mode — no vale la pena planear sobre el ticket equivocado.
- **No mezcles los cambios de estado con la implementación.** El ticket pasa a "En curso" recién cuando el plan está aprobado (no antes, para no marcar como iniciado algo que todavía podría cambiar de alcance), y pasa a "En revisión" recién cuando el PR existe de verdad (no antes, para que el estado en Jira refleje la realidad).
