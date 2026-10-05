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

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code v2.1.289

```text
Quiero reconstruir una spec viva del comportamiento que ya existe en FlowSync.

Limita la investigación exclusivamente a cuentas y acceso:
- registro
- login
- sesión
- perfil
- protección de rutas

Revisa tanto backend como frontend.

Por ahora NO escribas ni modifiques ningún archivo y NO propongas cambios de código.

Primero investiga el comportamiento actualmente implementado y entrégame:

1. Los comportamientos externamente observables que encuentres.
2. Para cada comportamiento, la evidencia en el código que te permite afirmarlo.
3. Las incoherencias o contradicciones que detectes entre backend y frontend.
4. Los puntos donde no puedas determinar solo desde el código si se trata de un bug o de una decisión deliberada de producto.
5. Cualquier afirmación sobre la que tengas incertidumbre.

No incluyas funcionalidades de tareas ni otras áreas fuera de cuentas y acceso.

**Qué salió:** 

Analizó backend y frontend sin modificar archivos; identificó comportamientos observables, incoherencias e incertidumbres.

## Prompt 2

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code v2.1.289

```text
Quiero verificar con ejecución real, sin modificar ningún archivo, algunas de las afirmaciones que quedaron como inferidas.

Usa únicamente peticiones contra la aplicación local ya levantada.

Comprueba, dentro del alcance de cuentas y acceso:

1. Qué status devuelve realmente el registro exitoso.
2. Qué status y cuerpo devuelve un login con credenciales incorrectas.
3. Qué ocurre al pedir el perfil sin token.
4. Qué ocurre al pedir el perfil con un token válido.
5. Si el email distingue mayúsculas y minúsculas en registro/login.
6. Si un email con espacios al inicio o al final es aceptado o rechazado.
7. Qué formato real tiene createdAt en la respuesta de perfil.
8. Si puedes observar alguna evidencia real de expiración de tokens.

No modifiques código ni archivos.
No pruebes funcionalidades de tareas.
Para cada prueba indica:
- petición ejecutada
- resultado observado
- qué afirmación anterior confirma o refuta
- cualquier incertidumbre que siga abierta

**Qué salió:** 
Verificó comportamientos reales con curl, confirmó varios contratos observables, refutó la duda sobre espacios en email y dejó sin resolver la expiración de tokens.

## Prompt 3

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code v2.1.289

```text
Redacta ahora la spec viva de cuentas y acceso de FlowSync usando únicamente los comportamientos que ya investigaste y verificaste.

Alcance exclusivo:
- registro
- login
- sesión
- perfil
- protección de rutas

Crea únicamente este archivo:

docs/spec-viva/rc.md

No modifiques código ni ningún otro archivo.

La spec debe describir solo comportamiento externamente observable del sistema. No menciones nombres de clases, archivos, funciones, middlewares, controladores, hooks, tablas ni detalles internos de implementación.

Usa exactamente esta estructura:

## Purpose

Una o dos frases que expliquen el propósito de esta capacidad.

## Requirements

### Requirement: <nombre del requisito>

El sistema SHALL ...

#### Scenario: <nombre del escenario>

- **WHEN** ...
- **THEN** ...

Cada Requirement debe tener al menos un Scenario.

Reglas de redacción:
- Escribe en español, excepto las palabras RFC SHALL, WHEN y THEN.
- No uses secciones ADDED, MODIFIED ni REMOVED.
- No conviertas automáticamente incoherencias, inferencias o detalles técnicos en requisitos.
- Incluye solo comportamientos respaldados por evidencia observada o por ejecución real.
- Si un comportamiento sigue siendo incierto, no lo conviertas en requisito.
- No intentes corregir comportamientos que parezcan defectuosos.
- No propongas mejoras.
- No incluyas funcionalidades de tareas ni otras áreas fuera de cuentas y acceso.

Ten especialmente en cuenta lo ya verificado:
- el registro exitoso devuelve una sesión válida;
- el login válido crea una sesión;
- credenciales incorrectas son rechazadas;
- el perfil requiere autenticación;
- el perfil puede obtenerse con una sesión válida;
- la UI protege las rutas de acceso y perfil según el estado de sesión;
- la sesión persiste en el cliente;
- el logout finaliza la sesión local;
- el email se recorta de espacios al inicio y al final;
- el email actualmente distingue mayúsculas de minúsculas.

No incluyas como contrato la expiración de tokens porque no quedó demostrada.

Después de crear el archivo, muéstrame:
1. cuántos Requirements escribiste;
2. una lista breve de los comportamientos que deliberadamente dejaste fuera por ser inciertos, incoherentes o detalles de implementación.

**Qué salió:** 
Creó docs/spec-viva/rc.md con 11 Requirements y 26 Scenarios, sin modificar código, y separó comportamientos excluidos por incertidumbre, incoherencia o detalle de implementación.

## Prompt 4

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code v2.1.289

```text
A partir únicamente de lo que ya investigaste y verificaste en esta sesión, ayúdame a preparar la Parte B del ejercicio.

No modifiques ningún archivo todavía.
No cambies la spec.
No hagas nuevas pruebas.
No investigues áreas nuevas.

Entrégame tres listas:

1. Indica cuántos Requirements escribiste en docs/spec-viva/rc.md.

   No determines cuántos he verificado yo personalmente.
   Esa cifra la completaré yo después según los Requirements que realmente haya abierto y revisado directamente en el código.

2. Lista las incoherencias que encontraste, una por línea, indicando brevemente dónde las observaste.

3. Lista los casos donde no se pueda decidir solo con la evidencia disponible si el comportamiento actual es un bug o parte del contrato.
   Para cada caso, explica brevemente las dos interpretaciones posibles.

Usa únicamente evidencia ya reunida durante esta sesión.
No conviertas inferencias en hechos.

**Qué salió:** 
Confirmó 11 Requirements, recopiló incoherencias y separó varios comportamientos cuya intención no permite decidir si son bug o contrato.