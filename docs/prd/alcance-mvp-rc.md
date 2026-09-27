# Alcance MVP — FlowSync

## 1. Terreno existente

Capacidades construidas: FlowSync ya tiene registro, login, logout y consulta del perfil propio, con soporte tanto en backend como en frontend. No hay nada de tareas, equipos ni tablero.

Modelo de datos actual: el modelo cubre usuarios y autenticación mediante tokens. No existen todavía tareas, equipos ni ninguna otra entidad de negocio.

## 2. Interrogatorio

### Las cinco preguntas

1. ¿Cómo se forma un equipo dentro de FlowSync? ¿Hay un admin que invita gente, un código de invitación, o cualquiera se une libremente?
2. ¿Hablamos de una tarea concreta, de una iniciativa/proyecto más amplio, o de ambos niveles a la vez?
3. ¿Cada persona marca manualmente en qué está trabajando y cuándo cambia, o esperas que se infiera de otra fuente (commits, tickets, etc.)?
4. ¿Qué señal te diría que esto funcionó — que se cancelaron los daily standups, que se detectan bloqueos antes, que hay visibilidad histórica de quién hizo qué?
5. ¿Basta con que el board se actualice al entrar/refrescar la página, o de verdad necesitas que cambie en vivo delante tuyo sin recargar (notificaciones push, websockets)?

### Hecho confirmado (no es un supuesto)

**"Tiempo real" = ver los cambios de estado de las tareas sin refrescar ni preguntar.** La vista se actualiza sola mientras permanece abierta, mostrando los cambios de otros sin que nadie recargue. "Sin notificaciones push" solo excluye avisos que interrumpan (banners, sonidos, etc.), no la actualización automática de la vista. Esto quedó definido explícitamente en la ficha del producto, no fue una interpretación mía.

### Lista final de supuestos

1. **Alta al espacio compartido:** no hay flujo de invitación; cualquier usuario que se registra (el signup ya existente) entra automáticamente al único espacio compartido.
2. **Taxonomía de estados de la tarea:** no se enumeran los estados exactos; se asume un set mínimo tipo pendiente / en curso / hecho, suficiente para distinguir qué está libre y qué no.
3. **Fecha de vencimiento:** solo fecha, sin hora.
4. **Asignación de tareas:** cualquiera puede crear una tarea y asignársela a cualquier otro miembro del espacio, no solo autoasignarse.

## 3. Alcance del MVP

### Problema

La ronda de "¿en qué estás?" en la daily (y las interrupciones equivalentes por chat) consume tiempo y aun así falla — sucede que dos personas tocan lo mismo sin saberlo, porque nadie tiene una vista fresca y compartida del estado de las tareas sin preguntar o interrumpir.

### Usuarios

Equipos remotos pequeños (3–10 personas), con roles planos y sin jerarquía de permisos, a menudo repartidos en varios husos horarios, que hoy resuelven esto con una daily por videollamada y con interrupciones puntuales por chat.

### Propuesta de valor

Una lista de tareas compartida donde marcar en qué estás trabajando cuesta dos clics — y por eso se sostiene, porque quien la actualiza también la usa como su propia cola de trabajo. La vista se mantiene fresca sola para cualquiera que la tenga abierta, así que el equipo puede dejar de preguntar "¿en qué estás?" sin dejar de saberlo.

### Alcance final después del recorte

- Un único espacio compartido: todo usuario registrado lo ve y lo edita, sin conceptos de equipo o pertenencia.
- Tareas con título, responsable y fecha de vencimiento.
- Cambiar el estado o el responsable de una tarea en pocos clics, sin campos obligatorios adicionales.
- Un conjunto mínimo de estados (pendiente / en curso / hecho) que permite distinguir qué está libre y qué no.
- La vista se actualiza sola mientras está abierta, mostrando los cambios de estado de otros sin recargar ni interrumpir con avisos.

### NO-alcance final después del recorte

- **Filtro por estado** — mejora la navegación, pero no es necesario para validar la hipótesis principal de que la frescura del estado reduce la ronda de "¿en qué estás?"; se puede ver todo el tablero de un vistazo sin filtrar.
- **Entidad "equipo" / múltiples espacios aislados** — no ayuda a validar si la frescura del estado sustituye a la ronda de la daily; solo prueba si el producto escala organizativamente, una pregunta distinta y prematura.
- **Notificaciones push / avisos interruptivos** — si empujáramos el aviso, no sabríamos si dejar de preguntar viene del hábito de mirar la lista o del empujón de la notificación; queremos aislar esa variable.
- **Integración con Slack u otras herramientas** — abriría un segundo lugar donde "se ve" el estado, compitiendo con la propia lista que necesitamos que el equipo adopte como su cola de trabajo real.
- **Derivar el estado de señales externas (Git/PRs, CI, calendario)** — se saltaría justo lo que hay que probar: si teclear el estado a mano, en segundos, es lo bastante barato para sostenerse sin fricción. Automatizarlo invalida la medición del riesgo #1.
- **Roles y permisos avanzados** — el problema es de visibilidad entre pares, no de gobernanza; añadir jerarquía no aporta nada a la hipótesis de que ver el estado del equipo basta para cancelar la ronda de la daily.
- **Comentarios en tareas** — desvía el foco de "ver el estado de un vistazo" hacia colaboración textual, que no es lo que se está probando.
- **Sprints, estimaciones, épicas, backlog priorizado, informes/analítica** — incluirlos contradice directamente la hipótesis "menos rollo que Jira"; son la carga que el producto existe para evitar.
- **Indicadores de presencia/conexión de personas** — la hipótesis es que el estado es de la TAREA, no de la PERSONA; mezclar presencia introduce una sensación de vigilancia que puede hacer que el equipo rechace la herramienta antes de que se pueda medir si la idea central funciona.

## Parte B — Las tres líneas

1. La IA propuso 6 elementos dentro del alcance; después de mi recorte quedaron 5.

2. Dejé fuera el filtro por estado porque mejora la navegación, pero no ayuda a validar si ver el estado fresco del equipo reduce la ronda de "¿en qué estás?"; dejé fuera las notificaciones push porque no ayudan a validar si la lista compartida por sí sola genera suficiente hábito de consulta; y dejé fuera la integración con Slack porque no ayuda a validar si FlowSync puede convertirse en el lugar principal donde el equipo consulta y actualiza su trabajo.

3. La exclusión de la que estoy menos seguro es el filtro por estado. Lo incorporaría si al probar el MVP observamos que mostrar todas las tareas juntas impide ver de un vistazo qué está pendiente o hace demasiado lenta la decisión sobre qué trabajo está libre.
