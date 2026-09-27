# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

---

## Prompt 1

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Quiero que FlowSync sea una herramienta para que los equipos remotos sepan en qué está trabajando cada uno sin tener que hacer reuniones de sincronización. Algo tipo tareas compartidas pero más en tiempo real y menos rollo que Jira.
```

**Qué salió:** una respuesta exploratoria corta con una recomendación y su trade-off, sin implementar nada todavía.

## Prompt 2

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Antes de proponer funcionalidades nuevas, inspecciona el estado actual de FlowSync.

En 3-5 líneas, resume únicamente:
- qué capacidades ya están construidas;
- cuál es el modelo de datos actual.

No propongas todavía nuevas funcionalidades, arquitectura, endpoints ni cambios de modelo de datos.
```

**Qué salió:** el resumen pedido de 3-5 líneas sobre capacidades y modelo de datos existentes.

## Prompt 3

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Antes de proponer el alcance del MVP, hazme las cinco preguntas que más reducirían la incertidumbre sobre el problema, los usuarios y el alcance.

Haz exactamente cinco preguntas y en una sola ronda.

No bajes todavía al modelo de datos, endpoints, arquitectura ni detalles de implementación.
```

**Qué salió:** las cinco preguntas pedidas, en una sola ronda.

## Prompt 4

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
- Qué duele hoy: la daily de sincronización y el "¿en qué estás?" constante por Slack/chat. Nadie ve el estado del equipo sin interrumpir a alguien.
- Quién cobra el valor: los pares, no un lead. No hay reporte hacia arriba y a un manager le daría igual. Duele a los dos devs que descubren tarde que iban a lo mismo, y al que interrumpe a otro para preguntar.
- Episodio concreto: dos personas del equipo tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Dos días perdidos.
- Qué reunión desaparece (respuesta honesta, no la vendas de más): la daily NO desaparece entera. Desaparece la ronda de "¿en qué estás?", que hoy se come la mitad de los 15 minutos. La parte de bloqueos sigue, y este MVP no la resuelve.
- Usuarios / equipo: equipos remotos pequeños, 3–10 personas. Roles planos: en el MVP todos ven y editan lo mismo, sin jerarquía de permisos.
- Primer usuario concreto: equipo de 6 personas de producto SaaS, en 3 husos horarios, que hoy usa un gestor de tareas pesado y una daily de 15 minutos por videollamada. Es un CASO DE ESTUDIO, no un cliente real.
- Fronteras: un espacio único compartido, sin entidad "equipo". Varios equipos separados, o gente en más de uno, queda FUERA del MVP: se anota como supuesto en el PRD, no se construye.
- "Tiempo real" = ver los cambios de estado de las tareas sin refrescar ni preguntar. NO es chat, NO es videollamada, NO es colaboración simultánea sobre el mismo documento.
- Es frescura, no presencia: el estado es de la TAREA, no de la persona. Nada de "quién está conectado ahora" ni indicadores de actividad; eso es vigilancia y lo rechazamos a propósito.
- Forma de la señal: resumen que espera, no aviso que interrumpe. El caso es "llego por la mañana o vuelvo de una reunión y veo qué se ha movido". Sin notificaciones push.
- Qué decisión cambia: no empezar algo que otra persona ya está tocando, y elegir lo siguiente sabiendo qué está libre. Si la única respuesta fuera "sentirse informado", el tiempo real no valdría lo que cuesta.
- De dónde sale el estado: lo teclea la persona que hace la tarea, en segundos. Derivarlo de señales externas (Git/PRs, CI, calendario) está FUERA del MVP: es otro producto, con integraciones y OAuth de terceros.
- Por qué se sostiene: no porque sea más agradable, sino porque son dos clics sobre una lista ya abierta, sin campos obligatorios, sin decidir sprint ni estimación. Y quien lo escribe cobra en el momento: esa misma lista es su cola de trabajo, la mira para decidir qué coge, y de paso deja de recibir interrupciones preguntándole cómo va. Si el beneficio fuera solo para los demás, no lo escribiría.
- Si la información se queda vieja: el producto pierde el sentido, y lo asumo. Es el riesgo #1 a validar, no un detalle. La mitigación es que actualizar cueste dos clics, no obligar a nadie.
- Es donde se hace el trabajo, no donde se cuenta: sustituye al gestor de tareas, no convive con él. FlowSync crea las tareas, no lee las de otro sitio. Convivir exigiría doble actualización, que es como muere esta categoría.
- Renuncia explícita a sprints, estimaciones, épicas, backlog priorizado e informes. Un equipo que necesite eso no es nuestro usuario.
- "Menos rollo que Jira" = crear una tarea y cambiarle el estado en segundos, sin flujos de configuración ni campos obligatorios. Lo mínimo para saber quién está en qué.
- Qué necesita una tarea en el MVP: título, responsable, estado y fecha de vencimiento. La fecha, para ver de un vistazo qué se ha pasado de plazo.
- Cómo se consume la lista: filtrando por estado, para centrarse en lo pendiente.
- Éxito para el usuario: dejar de hacer la ronda de "¿en qué estás?" de la daily porque el estado del equipo se ve de un vistazo.
- Criterio a una semana de uso real: que el equipo cancele esa ronda y nadie pida que vuelva. Si la siguen haciendo igual, no funcionó.
- Cuánto construir: una vertical fina y usable de punta a punta, no el andamiaje amplio de un producto. Prefiero una capability terminada a tres a medias.
- Fuera del MVP: notificaciones push, integración con Slack, roles/permisos avanzados, analítica/reporting, comentarios en tareas.

Si alguna de tus cinco preguntas no queda completamente respondida por esta ficha, decide tú la respuesta y márcala explícitamente como supuesto.

Al terminar, lista los supuestos que hayas tenido que introducir.
```

**Qué salió:** la lista de supuestos que tuve que introducir donde la ficha no respondía del todo a las cinco preguntas.

## Prompt 5

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Reviso tus supuestos:

- Mantén como supuestos los puntos 1, 3, 4 y 5.
- Corrige el punto 2: la ficha define explícitamente "tiempo real" como ver los cambios de estado de las tareas sin refrescar ni preguntar. Por tanto, no debe interpretarse como actualizar solo al entrar o al volver el foco.
- "Sin notificaciones push" significa que no queremos avisos que interrumpan, pero no elimina la actualización automática de la vista mientras está abierta.

No propongas todavía modelo de datos, endpoints ni arquitectura.

Devuélveme la lista final de supuestos corregida.
```

**Qué salió:** la lista final de supuestos corregida, con el punto 2 reescrito como hecho confirmado y no como interpretación.

## Prompt 6

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Con los hechos y supuestos que acabamos de acordar, propón el alcance del MVP de FlowSync en exactamente estos cinco bloques:

1. Problema
2. Usuarios
3. Propuesta de valor
4. Alcance
5. NO-alcance

Recorta de forma agresiva: buscamos una vertical fina y usable de punta a punta, no un producto amplio.

Para cada elemento del NO-alcance, explica por qué queda fuera y qué hipótesis principal del producto no ayuda a validar.

Mantente estrictamente a nivel de producto. No incluyas modelo de datos, tablas, endpoints, arquitectura, tecnologías, diagramas, casos de uso técnicos ni detalles de implementación.

No redactes todavía historias de usuario ni criterios de aceptación.
```

**Qué salió:** el alcance del MVP en los cinco bloques pedidos, con la justificación de cada elemento del NO-alcance.

## Prompt 7

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Voy a recortar tu propuesta.

Mantén dentro del MVP:
- un único espacio compartido;
- tareas con título, responsable y fecha de vencimiento;
- cambio de estado o responsable en pocos clics;
- un conjunto mínimo de estados;
- actualización automática de la vista sin refrescar.

Deja fuera del MVP el filtro por estado. Motivo: mejora la navegación, pero no es necesario para validar la hipótesis principal de que la frescura del estado reduce la ronda de “¿en qué estás?”.

Actualiza solo los bloques Alcance y NO-alcance con este recorte. No agregues nuevas funcionalidades ni detalles técnicos.
```

**Qué salió:** los bloques Alcance y NO-alcance actualizados con el recorte del filtro por estado.

## Prompt 8

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Crea el archivo docs/prd/alcance-mvp-rc.md con el resultado de esta sesión hasta este momento.

Debe contener, en este orden:

1. Terreno existente
   - el resumen de 3-5 líneas que obtuvimos sobre las capacidades actuales y el modelo de datos existente.

2. Interrogatorio
   - las cinco preguntas que formulaste;
   - la lista final de supuestos, diferenciando claramente que "tiempo real = cambios visibles sin refrescar" es un hecho confirmado del producto y no un supuesto.

3. Alcance del MVP
   - Problema
   - Usuarios
   - Propuesta de valor
   - Alcance final después de mi recorte
   - NO-alcance final después de mi recorte

No agregues historias de usuario, criterios de aceptación, modelo de datos nuevo, endpoints, arquitectura ni detalles de implementación.

No inventes contenido nuevo: usa únicamente lo que ya trabajamos en esta sesión.
```

**Qué salió:** se creó `docs/prd/alcance-mvp-rc.md` con las tres secciones pedidas.

## Prompt 9

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Haz una corrección mínima en docs/prd/alcance-mvp-rc.md.

En la sección "1. Terreno existente", elimina los nombres concretos de endpoints, tablas y campos para mantener el documento estrictamente a nivel de producto.

Conserva únicamente estas ideas:
- FlowSync ya tiene registro, login, logout y consulta del perfil propio, con soporte en backend y frontend.
- El modelo actual cubre usuarios y autenticación mediante tokens.
- Todavía no existen tareas, equipos ni otras entidades de negocio.

No modifiques ninguna otra sección del documento.
```

**Qué salió:** se corrigió solo la sección "1. Terreno existente", quitando nombres técnicos concretos.

## Prompt 10

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Actualiza prompts.md usando el historial de esta sesión.

Reemplaza el ejemplo de la plantilla y registra, en el orden exacto en que fueron enviados, todos los prompts que yo escribí durante esta sesión relacionados con la preparación y ejecución de este ejercicio.

Para cada uno:
- usa un apartado "## Prompt N";
- indica:
  - Modelo: Sonnet 5 with high effort
  - Herramienta: Claude Code
- copia el texto del prompt literalmente, sin corregirlo, resumirlo ni reformularlo;
- añade en "Qué salió" solo una línea breve describiendo el resultado.

No incluyas las sugerencias automáticas que tú mostraste debajo de tus respuestas y que yo no envié.

Incluye también este mismo prompt como el último de la lista.

No modifiques ningún otro archivo.
```

**Qué salió:** este mismo archivo, reemplazando el ejemplo por los diez prompts de la sesión en orden.

## Prompt 11

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Añade al final de docs/prd/alcance-mvp-rc.md una sección titulada:

## Parte B — Las tres líneas

Incluye exactamente este contenido, sin reformularlo:

1. La IA propuso 6 elementos dentro del alcance; después de mi recorte quedaron 5.

2. Dejé fuera el filtro por estado porque mejora la navegación, pero no ayuda a validar si ver el estado fresco del equipo reduce la ronda de “¿en qué estás?”; dejé fuera las notificaciones push porque no ayudan a validar si la lista compartida por sí sola genera suficiente hábito de consulta; y dejé fuera la integración con Slack porque no ayuda a validar si FlowSync puede convertirse en el lugar principal donde el equipo consulta y actualiza su trabajo.

3. La exclusión de la que estoy menos seguro es el filtro por estado. Lo incorporaría si al probar el MVP observamos que mostrar todas las tareas juntas impide ver de un vistazo qué está pendiente o hace demasiado lenta la decisión sobre qué trabajo está libre.

No modifiques ninguna otra sección del archivo.
```

**Qué salió:** se añadió la Parte B con las tres líneas al archivo de alcance.

## Prompt 12

**Modelo:** Sonnet 5 with high effort
**Herramienta:** Claude Code

```
Actualiza únicamente prompts.md.

Añade como Prompt 11 el prompt inmediatamente anterior que te envié para agregar la sección "Parte B — Las tres líneas" a docs/prd/alcance-mvp-rc.md. Cópialo literalmente, sin resumirlo ni reformularlo.

Añade después este mismo prompt como Prompt 12.

Para ambos usa:
- Modelo: Sonnet 5 with high effort
- Herramienta: Claude Code

En "Qué salió":
- Prompt 11: se añadió la Parte B con las tres líneas al archivo de alcance.
- Prompt 12: se actualizaron los prompts finales de la sesión.

No modifiques ningún otro archivo.
```

**Qué salió:** se actualizaron los prompts finales de la sesión.
