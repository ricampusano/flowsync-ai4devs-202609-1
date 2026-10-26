# Revisor automático en CI

[`.github/workflows/claude-review.yml`](../.github/workflows/claude-review.yml) lanza
[la acción oficial de Claude Code](https://github.com/anthropics/claude-code-action) cada vez que se
abre, se actualiza o se reabre un PR. Claude lee el cambio y publica cada hallazgo como comentario
sobre la línea afectada. No aprueba, no bloquea y no modifica código: solo comenta. Si no encuentra
nada, no publica nada.

## Qué puede tocar el revisor

El diff del PR lo prepara un paso previo del job (`.pr-review/files.txt` y `.pr-review/pr.diff`), así
que el revisor no necesita ningún comando para obtenerlo. Sus herramientas son las mínimas:

- `Read(./**)`, `Grep(./**)` y `Glob(./**)`: leer, **solo dentro del directorio de trabajo**. Con
  `Read` a secas podría leer fuera, por ejemplo el entorno del proceso, que contiene la credencial.
- `mcp__github_inline_comment__create_inline_comment`: comentar sobre una línea del PR. Es su único
  canal de salida.
- Prohibidas de forma explícita: `Bash`, `WebFetch`, `WebSearch`, `Write`, `Edit` y `NotebookEdit`.
  Sin `Bash` no hay `gh pr comment --body-file …` ni sustituciones de comandos con las que publicar
  un fichero cualquiera.

Esto reduce el riesgo, no lo elimina. El diff y los ficheros del PR siguen entrando en el prompt, y
con ellos cualquier instrucción inyectada. Lo que queda acotado es lo que el modelo puede leer y por
dónde puede sacarlo.

## Pasos manuales pendientes

El fichero del workflow no basta. Hasta que no se hagan estos pasos, el job falla o no sirve:

1. **Crear el secreto con la credencial** (ver [Credencial](#credencial)). Sin él, el job falla al
   arrancar la acción.
2. **Permitir la acción en el repositorio.** Si la organización restringe qué acciones se pueden
   usar (*Settings → Actions → General → Actions permissions*), hay que autorizar
   `anthropics/claude-code-action` y `actions/checkout`.
3. **Comprobarlo con un PR de prueba** desde una rama de este mismo repositorio. Lo primero que hay
   que mirar es que los comentarios aparezcan en el PR y no solo en el log de la ejecución.

El criterio del revisor (qué es grave, cuántas sugerencias caben y dónde no reportar) vive en
[`REVIEW.md`](../REVIEW.md), en la raíz. El prompt le dice que lo lea antes que nada.

No hace falta instalar la GitHub App de Claude. El job se autentica en GitHub con el `GITHUB_TOKEN`
que crea cada ejecución, limitado a leer el repositorio y comentar en el PR. Por eso los
comentarios salen firmados por `github-actions[bot]` y no por `claude[bot]`.

## Credencial

La acción admite dos tipos de credencial. Cada uno va en **su propia entrada** de la acción y se
guarda con **su propio nombre de secreto** (*Settings → Secrets and variables → Actions → New
repository secret*):

| Camino | Cómo se obtiene | Entrada de la acción | Nombre del secreto |
|---|---|---|---|
| **1. Suscripción** (Pro o Max) | `claude setup-token` en local: abre el navegador, inicias sesión y la terminal imprime el token | `claude_code_oauth_token` | `CLAUDE_CODE_OAUTH_TOKEN` |
| **2. Clave de API** | Se crea en la consola de Anthropic (Claude Console), en *API keys* | `anthropic_api_key` | `ANTHROPIC_API_KEY` |

El workflow viene configurado para el **camino 1**:

```yaml
claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

Para usar el **camino 2**, cambia esa línea por:

```yaml
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

Deja solo una de las dos.

> **No son intercambiables.** Si guardas un token de suscripción como `ANTHROPIC_API_KEY`, o una
> clave de API en la entrada `claude_code_oauth_token`, el job no avisa al arrancar: falla en la
> primera llamada al modelo con un error de autenticación que no dice que el problema sea el *tipo*
> de credencial. Si ves un fallo de autenticación con un secreto que acabas de crear, revisa
> primero que el camino, la entrada y el nombre del secreto sean de la misma fila de la tabla.

## En qué se va el dinero

Cada ejecución es una sesión de Claude Code que lee el diff, abre ficheros y escribe comentarios.
Se cobra por ejecución, y hay una por cada push a un PR abierto.

- **Modelo: Sonnet con esfuerzo medio** (`--model sonnet --effort medium` en `claude_args`).
  `sonnet` es un alias: apunta siempre al Sonnet más reciente, así que el modelo concreto puede
  cambiar sin tocar el fichero. Se usa Sonnet porque la tarea es leer un diff acotado y comentar,
  algo que un modelo intermedio hace bien a una fracción del coste de Opus. El esfuerzo medio evita
  pagar razonamiento largo en cada hallazgo menor.
- **Topes:** `--max-turns 40` limita las idas y vueltas de la sesión, y `timeout-minutes: 10` corta
  el job por tiempo. Lo que se haya publicado antes del corte se queda en el PR.
- **Pushes seguidos:** si se hace otro push mientras una revisión sigue en marcha, esa revisión se
  cancela (`concurrency` con `cancel-in-progress`) para no pagar una revisión entera de un código
  que ya ha cambiado.
- **Cómo cambiar el modelo:** edita `--model` en `claude_args`. Vale un alias (`opus`, `haiku`) o
  un identificador completo de la
  [lista de modelos](https://platform.claude.com/docs/en/models/overview). Con el esfuerzo se hace
  igual, editando `--effort`.
- **Precio:** depende del camino de la credencial. Con suscripción, las ejecuciones consumen el
  límite de uso del plan ([planes de Claude](https://claude.com/pricing)). Con clave de API, se
  facturan por tokens según la
  [tabla de precios de la API](https://platform.claude.com/docs/en/about-claude/pricing). Aquí no
  hay cifras a propósito: cambian, y una cifra copiada en este documento se quedaría desfasada sin
  que nadie se enterara.

## PRs desde un fork en un repositorio público

GitHub no pasa los secretos del repositorio a los workflows que lanza un PR desde un fork, y el
`GITHUB_TOKEN` de esas ejecuciones es de solo lectura. Por eso el revisor no podría autenticarse
con Anthropic ni comentar en el PR.

Para que eso no se vea como un fallo rojo en cada contribución externa, el job lleva una condición
que **lo salta** cuando la rama del PR no es de este repositorio. Esos PRs se quedan sin revisión
automática y hay que revisarlos a mano.

No hay que «arreglarlo» cambiando el disparador a `pull_request_target`. Ese evento sí da acceso a
los secretos, pero lo haría sobre código y texto que controla un desconocido: el diff y la
descripción del PR acaban dentro del prompt, y eso abre la puerta a que se filtre la credencial.
