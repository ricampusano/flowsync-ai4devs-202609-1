#!/usr/bin/env bash
# PostToolUse (Edit|Write|NotebookEdit): formatea con Prettier el archivo recién
# editado, solo si cae bajo frontend/ y tiene una extensión que Prettier maneja.
# Best-effort: cualquier fallo (prettier no instalado, archivo fuera de scope, etc.)
# termina en exit 0 silencioso, nunca bloquea al agente.

input="$(cat)"

# No asumimos jq disponible (no lo está en todos los entornos); usamos node,
# que sí está garantizado en este repo, con python3 como respaldo.
if command -v node >/dev/null 2>&1; then
  file_path="$(printf '%s' "$input" | node -e '
    let d="";
    process.stdin.on("data", c => d += c);
    process.stdin.on("end", () => {
      try {
        const j = JSON.parse(d);
        const p = j?.tool_input?.file_path ?? j?.tool_input?.notebook_path ?? j?.tool_response?.filePath ?? "";
        process.stdout.write(p);
      } catch { process.stdout.write(""); }
    });
  ' 2>/dev/null)"
elif command -v python3 >/dev/null 2>&1; then
  file_path="$(printf '%s' "$input" | python3 -c '
import sys, json
try:
    j = json.load(sys.stdin)
    ti = j.get("tool_input") or {}
    tr = j.get("tool_response") or {}
    print(ti.get("file_path") or ti.get("notebook_path") or tr.get("filePath") or "", end="")
except Exception:
    pass
' 2>/dev/null)"
else
  exit 0
fi

[ -z "$file_path" ] && exit 0

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
repo_root="$(cd "$script_dir/../.." >/dev/null 2>&1 && pwd)"
frontend_dir="$repo_root/frontend"

case "$file_path" in
  "$frontend_dir"/*) ;;
  *) exit 0 ;;
esac

case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.css|*.scss|*.html|*.md|*.yml|*.yaml) ;;
  *) exit 0 ;;
esac

prettier_bin="$frontend_dir/node_modules/.bin/prettier"
if [ -x "$prettier_bin" ]; then
  "$prettier_bin" --write "$file_path" >/dev/null 2>&1 || true
fi

exit 0
