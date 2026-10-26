# Calibración del revisor

Solo para revisiones de código. Si choca con tu criterio general, manda este archivo.

## Grave: va siempre, sin tope

- Un scenario de `openspec/specs/<capability>/spec.md` deja de cumplirse. Nombra el scenario.
- Una respuesta expone datos de cuenta que la spec no permite, o una ruta protegida responde sin
  sesión.
- Una petición inválida devuelve 2xx en vez del error que pide la spec, o destruye o cambia datos
  que debía conservar.
- Una respuesta no sale por `serialize()` + un transformer de `app/transformers/`.
- El cambio toca rutas, controladores, validadores o transformers y no actualiza en el mismo PR el
  README de su capability (`docs/capabilities/<nombre>/README.md`).

Cualquier otra cosa es sugerencia: nombres, estructura, refactors, tests deseables, rendimiento sin
una medida que lo respalde. También formato, lint y tipos: ningún job de CI los ejecuta, así que si
ves uno roto en el diff, cuenta como sugerencia.

## Tope de sugerencias

Como mucho **5 sugerencias menores** por revisión, las de más impacto. El resto se resume contado
en el comentario final («y 7 más: 4 de nombres, 3 de tests»), sin detallarlas.

## Dónde no reportar

- Desfase entre `docs/api/openapi.json` y el código: lo vigila el job `openapi:check`.
- Ficheros generados: `backend/.adonisjs/`, `backend/database/schema.ts`,
  `frontend/src/components/ui/` y los `package-lock.json`.
- `README.md` de la raíz: es la lección del curso, no documentación del producto.

## Evidencia

Para afirmar cómo se comporta algo, cita el `archivo:línea` donde lo has leído. No lo deduzcas del
nombre de una función ni de un comentario: aquí hay comentarios que afirman lo contrario de lo que
hace el código. Si no lo has leído, o no lo puedes citar, márcalo como **sospecha** o no lo
reportes.
