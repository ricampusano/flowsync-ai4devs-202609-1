# 1. OpenSpec como fuente de verdad viva del comportamiento

Fecha: 2026-10-15

## Contexto

FlowSync parte de un PRD (`docs/prd/`) y de un backlog de historias con criterios de aceptación (`docs/backlog/`). Esos documentos describen la intención, pero no el comportamiento vigente: las historias se abren, se cierran y se contradicen entre sí, y el código no dice por sí solo qué estaba decidido y qué era accidental.

El proyecto usa OpenSpec con el schema `spec-driven`. Hoy hay en `openspec/`:

- **Specs vivas** en `openspec/specs/<capability>/spec.md`: `auth` (19 requisitos, 45 escenarios) y `tasks` (32 requisitos, 124 escenarios). Cada requisito usa `SHALL` y se concreta en escenarios `WHEN`/`THEN`.
- **Tres changes archivados** en `openspec/changes/archive/`, todos del 2026-08-13: `add-task-list`, `add-task-status-filter` y `add-task-due-date`. Cada uno tiene `proposal.md`, `design.md`, `tasks.md` y un directorio `specs/` con **delta-specs**.
- **Delta-specs**: un change no reescribe la spec, declara su diferencia con ella mediante `## ADDED Requirements` y `## MODIFIED Requirements`. `add-task-list` creó `tasks` y modificó `auth` (la lista pasó a ser la pantalla de entrada). `add-task-status-filter` modificó cuatro requisitos de `tasks` que el filtro volvía falsos, entre ellos «Una sola lista compartida del espacio», que afirmaba que la lista devolvía *todas* las tareas. `add-task-due-date` añadió doce y modificó uno.
- Al archivar, las deltas se sincronizan con la spec viva (`openspec-sync-specs`, `openspec-archive-change`). El historial de Git lo refleja: `docs(openspec): el filtro por estado entra en la spec viva`.

`openspec/config.yaml` conserva la plantilla por defecto: no declara contexto de proyecto ni reglas por artefacto. Todo el proceso descrito arriba es convención, no configuración.

## Decisión

La spec viva de `openspec/specs/` es la fuente de verdad del comportamiento de FlowSync. El PRD y el backlog siguen siendo la fuente de la intención; ante una discrepancia sobre qué hace o debe hacer el sistema, manda la spec.

Cambiar el comportamiento implica un change de OpenSpec cuya delta-spec exprese la diferencia (`ADDED`, `MODIFIED`), y esa delta se sincroniza con la spec viva al archivarse. La spec no se edita a mano al margen de un change. El `design.md` de cada change registra las decisiones y alternativas descartadas; `proposal.md` registra el porqué y lo que queda fuera de alcance.

## Estado

Aceptada. Se registra a posteriori: la práctica ya estaba en uso en los tres changes archivados y este ADR la formaliza, no la propone.

## Consecuencias

**Lo que ganamos**

- Hay un único sitio donde mirar qué hace el sistema, redactado de forma verificable (`SHALL` más escenarios), en vez de reconstruirlo desde historias y código.
- Las deltas hacen visible qué cambia y qué deja de ser cierto. El filtro por estado obligó a corregir requisitos existentes; sin ese mecanismo habrían quedado afirmando algo falso.
- Los `design.md` conservan las decisiones y los riesgos aceptados (por ejemplo, la desviación consciente respecto a CA-17), que de otro modo se perderían con la sesión.
- La spec sirve de referencia para documentar la API: la documentación OpenAPI se contrastó contra ella.

**Lo que nos cuesta**

- **La spec no se comprueba sola.** Los changes archivados declaran explícitamente que no añaden tests y que su verificación fue manual. Hoy hay 124 escenarios en `tasks` y casi ninguno tiene prueba asociada. Una «fuente de verdad» sin comprobación mecánica puede dejar de ser verdad sin que nadie lo note.
- **Ya hay una divergencia observada.** La spec (`tasks`, «Un estado que no existe se rechaza, no se responde vacío») y el `design.md` de `add-task-status-filter` dicen que el validador es `vine.enum(TASK_STATUSES).optional()` y que `?status=archivado` da `422`. El validador actual es `vine.string().optional()`, lo que por lectura de código apunta a un `200` con lista vacía, justo el fallo que la spec quería hacer imposible. No está confirmado con una ejecución. Nada del proceso lo ha detectado, y es el ejemplo de este coste.
- **Cuando spec y código discrepan, hay que elegir.** Este ADR da prioridad a la spec, pero eso no dice qué está mal: puede ser el código, o una decisión posterior que nadie llevó a la spec. Cada caso exige decidirlo, y la sincronización spec-código queda a cargo de disciplina humana.
- **Coste de redacción.** Un cambio pequeño exige proposal, design, tasks y delta-spec. Los changes existentes son extensos (entre 185 y 227 líneas de artefactos cada uno, sin contar la delta). Es un impuesto sobre cada cambio y puede empujar a saltarse el proceso en los que parezcan triviales.
- **Documentación a posteriori.** `add-task-status-filter` documenta comportamiento que ya estaba implementado. Cuando el change describe lo ya hecho, la spec registra lo que el código hacía, no necesariamente lo que se había decidido.
- **Specs grandes y fáciles de dejar obsoletas.** `tasks/spec.md` ronda las 750 líneas. Los `MODIFIED` obligan a localizar y reescribir requisitos completos; olvidarse de uno deja la spec contradiciéndose a sí misma.
- **Dependencia de una herramienta y de convenciones no configuradas.** Que `config.yaml` esté sin rellenar significa que nada obliga a seguir el flujo; depende de las skills `openspec-*` y de que las usemos.
- **Hay decisiones sin cerrar dentro de la spec.** Los changes dejan abiertas cuestiones de producto (PA-3, PA-7, PA-8); la spec vigente convive con ellas sin resolverlas.
