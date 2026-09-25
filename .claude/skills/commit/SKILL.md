---
name: commit
description: Revisa los cambios staged (git diff --staged), genera un mensaje siguiendo Conventional Commits y crea el commit directamente. Úsala cuando el usuario pida "haz commit", "commitea esto", "genera el mensaje de commit y commitea", "crea un commit con lo que tengo staged", o cualquier variante donde quiera que el agente redacte el mensaje y ejecute el commit sin dictárselo él mismo.
---

# commit

Redacta un mensaje de commit en formato Conventional Commits a partir de lo que ya está staged, y ejecuta el commit. El usuario invocar esta skill ya es la autorización explícita para commitear — no hace falta volver a preguntar "¿confirmas que haga el commit?" salvo que algo en los pasos de abajo lo amerite (nada staged, posibles secretos, etc.).

## Flujo

### 1. Verificar que hay algo staged

Corre `git status` y `git diff --staged --stat`. Si no hay nada en el área de staging, dilo y detente — **no** stagees archivos por tu cuenta con `git add -A` ni `git add .`; el usuario decide qué entra en el commit. Si quiere que agregues algo, que lo pida explícitamente (y en ese caso agrega archivos puntuales por nombre, no todo el working tree).

### 2. Revisar el diff completo, no solo el stat

Corre `git diff --staged` (el diff completo, no el `--stat`) para entender de verdad qué cambió — el stat solo te dice qué archivos, no qué tan significativo es el cambio dentro de cada uno. Presta atención a si el cambio es realmente una sola cosa coherente o si mezcla propósitos distintos (eso afecta si conviene un solo `type` o si vale la pena avisarle al usuario que parece haber dos commits mezclados).

Mientras revisás el diff, fijate si algún archivo staged podría contener secretos o credenciales (`.env`, tokens, claves) aunque el nombre parezca inocente — si ves algo así, avisa al usuario antes de commitear en vez de commitearlo silenciosamente.

### 3. Mirar el historial reciente para seguir el estilo del repo

Corre `git log --oneline -10` (o similar) para ver cómo se han escrito los commits recientes en este repo — prefijos usados, si incluyen scope, idioma (este repo tiene documentación en español, así que fijate si los commits también lo están, o si el equipo commitea en inglés pese a documentar en español). Sigue ese estilo en vez de imponer uno genérico.

### 4. Redactar el mensaje en Conventional Commits

Formato: `tipo(scope opcional): descripción corta en imperativo`, con cuerpo opcional si el diff lo amerita.

Tipos habituales: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`. Elegí el que de verdad describa la naturaleza del cambio (no todo es `feat`: una corrección es `fix`, un cambio de infraestructura de test es `test` o `chore`, etc.).

El scope, si lo usás, sale del área tocada — en este repo probablemente `backend`, `frontend`, o un módulo más específico dentro de esas carpetas (ver `CLAUDE.md` para la arquitectura de cada app).

La descripción corta explica el **qué** en imperativo ("agrega", "corrige", "elimina" — o en inglés si el historial reciente está en inglés). Si el cambio no es autoexplicativo por su naturaleza (por ejemplo, un fix no trivial, o una decisión de diseño), agregá un cuerpo breve explicando el **por qué**, no una relistado de qué líneas cambiaron — eso ya lo muestra el diff.

### 5. Ejecutar el commit

Usa un heredoc para el mensaje (evita problemas de escapado de comillas):

```bash
git commit -m "$(cat <<'EOF'
tipo(scope): descripción corta

Cuerpo opcional si hace falta explicar el por qué.
EOF
)"
```

Reglas duras, sin excepción salvo que el usuario lo pida explícitamente para ese commit puntual:
- Nunca `--no-verify` (no te saltees hooks de pre-commit).
- Nunca `--amend` (siempre un commit nuevo).
- Nunca fuerces nada (`--no-gpg-sign`, etc.).
- Termina el mensaje con las líneas de atribución que indique el system reminder de la sesión, si hay alguna configurada.

Si el hook de pre-commit falla, no lo saltees: investigá por qué falló, arreglá lo que corresponda, volvé a stagear y creá un commit nuevo (no reintentes con `--amend` sobre un commit que nunca llegó a existir).

### 6. Confirmar

Corre `git status` después del commit para verificar que quedó todo commiteado como se esperaba, y mostrale al usuario el hash corto y el mensaje final usado.

## Notas importantes

- Esta skill nunca hace `git push` — commitea localmente y ahí termina, salvo que el usuario pida explícitamente subir los cambios.
- Si el staged mezcla cambios de propósitos claramente distintos (por ejemplo, un fix de backend junto con un cambio de docs sin relación), consideralo una señal para avisarle al usuario y preguntar si prefiere separarlos en vez de forzar un solo mensaje que intente cubrir todo.
