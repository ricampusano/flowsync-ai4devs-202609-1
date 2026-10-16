# 2. Los tests de integración como única fuente de verdad ejecutable

Fecha: 2027-10-15

> Escenario hipotético: este ADR asume que dentro de un año se abandona el mantenimiento de las specs de OpenSpec. Lo descrito como situación de entonces es una premisa, no un hecho de hoy; lo que se cita del repositorio actual está marcado como tal.

## Contexto

El [ADR 0001](0001-openspec-como-fuente-de-verdad.md) fijó la spec viva de OpenSpec como fuente de verdad del comportamiento. Su propio apartado de consecuencias advertía del coste principal: la spec no se comprueba sola. Los tres changes archivados declaran que no añaden tests y que su verificación fue manual.

Estado del repositorio a fecha de la redacción de este escenario (2026-10-15):

- `openspec/specs/` tiene 169 escenarios `WHEN`/`THEN` (45 en `auth` y 124 en `tasks`).
- Hay tests de integración Japa solo para `auth` y para el responsable de las tareas (`backend/tests/functional/`). La mayor parte de los escenarios de `tasks` no tiene prueba.
- Ya se observó una divergencia sin que el proceso la detectara: la spec exige `422` ante `?status=archivado`, pero el validador acepta cualquier cadena (por lectura de código; sin confirmar con una ejecución).
- Las suites functional comparten fichero SQLite con el servidor de desarrollo, lo que obliga a aislar a mano cada test que escribe.

Premisa de este ADR: tras un año de uso, mantener a mano specs, deltas y changes cuesta más de lo que aporta, y el problema de fondo sigue siendo el mismo, que la spec puede dejar de ser cierta sin que nada falle.

## Decisión

Dejamos de mantener las specs de OpenSpec. La fuente de verdad del comportamiento pasa a ser el conjunto de **tests de integración**, ejecutados en CI y verdes antes de fusionar.

- Un comportamiento que el sistema promete existe si y solo si hay un test que lo ejercita contra la API real (Japa, suite `functional`, con el aislamiento de `testUtils.db()`).
- El nombre del test dice el comportamiento; el cuerpo, el `WHEN` y el `THEN`. Se agrupan por capability.
- Un cambio de comportamiento es un cambio de tests, en la misma petición que el cambio de código.
- `openspec/specs/` y `openspec/changes/archive/` se conservan como histórico, sin actualizar. No se borran: explican por qué el sistema es como es.
- El PRD y el backlog siguen siendo la fuente de la intención.
- Los escenarios de las specs que sigan siendo ciertos se portan a tests antes de dar por cerrada la migración. Hasta entonces, lo que no tenga test no se considera especificado.

## Estado

Aceptada (escenario hipotético). Reemplaza al [ADR 0001](0001-openspec-como-fuente-de-verdad.md).

## Consecuencias

**Lo que ganamos**

- La fuente de verdad se comprueba sola: si el comportamiento cambia sin que cambie el test, la CI falla. Es la propiedad que le faltaba al 0001.
- Una divergencia como la del filtro de estado se vuelve un test en rojo, no un hallazgo manual.
- Desaparece el coste de proposal, design, tasks y delta-spec por cada cambio.
- Se acaba la deriva entre la spec y el código, porque deja de haber dos fuentes que sincronizar.

**Lo que nos cuesta**

- **Hay que escribir primero los tests que nunca se escribieron.** Hoy casi todos los escenarios de `tasks` no tienen test. La migración no es gratuita, y mientras dure, la fuente de verdad es más pequeña que el comportamiento real.
- **Perdemos el porqué.** Los `design.md` guardaban alternativas descartadas y riesgos aceptados, por ejemplo la desviación respecto a CA-17. Un test dice qué hace el sistema, no por qué ni qué se rechazó. Esas decisiones deberían pasar a ADRs, y si no pasan, se pierden.
- **Un test solo prueba lo que alguien pensó probar.** Una spec en prosa puede decir «NO SHALL existir ninguna vista de tareas propia»; un test de ausencia es mucho más difícil de escribir y de agotar. Los requisitos negativos son los que peor se traducen.
- **Menos legible para quien no programa.** El producto leía la spec en castellano. Un test no es un documento para negociar con producto, y la conversación sobre qué se debe construir pierde su artefacto.
- **Perdemos la visión de conjunto.** Una spec se lee de arriba abajo; una suite de tests exige ejecutarla o recorrerla. Responder «¿qué hace el sistema?» sin ejecutar nada pasa a ser más lento.
- **El coste de mantenimiento se traslada, no desaparece.** Los tests de integración son más lentos, se rompen por motivos ajenos al comportamiento (datos, fechas, el SQLite compartido) y su flakiness erosiona la confianza en lo que se ha declarado fuente de verdad.
- **Solo cubre la API.** El frontend no tiene runner de tests. Mientras no lo tenga, el comportamiento de las pantallas (filtro en la URL, avisos, estados vacíos) queda fuera de la fuente de verdad ejecutable.
- **Dejar de mantener las specs las vuelve falsas poco a poco.** Si siguen en el repositorio, alguien las leerá como vigentes. Hay que marcarlas como históricas de forma visible.
