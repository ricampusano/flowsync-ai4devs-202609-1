# Proposal

## Why

FlowSync todavía no tiene su objeto central: las tareas. Hoy una persona puede registrarse y ver su perfil, pero el equipo no puede anotar en qué anda ni ver en qué anda cada uno. Este change da de alta la capability de tareas con lo mínimo que responde «quién está en qué»: una lista única y compartida donde crear una tarea cuesta escribir un título y cambiar su estado cuesta un clic. Cubre las historias E3-1, E2-1, E2-2, E2-3 y E2-4 del backlog.

## What Changes

- **API (backend)**: tres operaciones bajo `/api/v1/tasks`, todas autenticadas: listar todas las tareas, crear una (solo título) y actualizarla (estado y responsable). Nada más.
- **Modelo de datos**: nueva tabla de tareas con título, estado y responsable. Sin fecha de vencimiento.
- **Estados**: conjunto cerrado `pending`, `in_progress` y `done` en la API; cualquier otro valor se rechaza con 422. La interfaz los pinta como Pendiente, En curso y Hecho.
- **Interfaz (frontend)**: nueva pantalla `/tasks`, protegida como el perfil, con el formulario de un solo campo (título), la lista compartida y el cambio de estado desde cada fila. Reutiliza los componentes de `components/ui/` y el patrón de páginas y rutas del login. El inicio de la aplicación (`/profile`) no cambia; se enlazan entre sí.
- **Reglas fijas**: una sola lista para todos, sin tareas privadas ni vista «mis tareas»; cualquiera cambia estado y responsable de cualquier tarea; la tarea nace pendiente y con quien la crea como responsable; en la lista el responsable se ve por su nombre, o «Sin nombre».
- **Fuera de este change**: sin tests ni base de pruebas, sin fechas, sin lectura individual ni borrado, sin endpoints de equipo, sin edición de título, sin refresco automático (E3-2), sin filtros.

## Capabilities

### New Capabilities
- `tasks`: la lista compartida de tareas del equipo: listar, crear con solo título, estado cerrado de tres valores, responsable por defecto y cambio de estado y responsable.

### Modified Capabilities
<!-- Ninguna. La autenticación existente se reutiliza sin cambiar sus requisitos. -->

## Impact

- **Backend**: nueva migración (regenera `database/schema.ts`), modelo, validadores, transformer, controlador y rutas; el registro generado de `.adonisjs/` cambia al arrancar.
- **Frontend**: nuevas llamadas en `lib/api.ts`, tipos, página, ruta protegida y enlace desde el perfil.
- **Dependencias**: ninguna nueva.
- **API existente**: sin cambios incompatibles.

## Puntos abiertos

Decisiones de producto sin tomar. Este change no las resuelve ni inventa un criterio:

- **Orden de la lista (PA-3).** No hay regla de orden ni de agrupación. La lista no se ordena de forma explícita: el orden que se vea es el que devuelva la base de datos y no es un contrato. Sin él, E3-1 CA-5 («enumerar el trabajo de cada persona») no se sostiene con volumen.
- **Longitud máxima del título (PA-9).** El umbral no está decidido, así que no se valida un máximo y E2-2 CA-3 (avisar en vez de recortar) queda fuera hasta fijarlo.
- **Transiciones de estado (PA-7).** Se permite cualquier cambio entre los tres estados, incluida la vuelta desde Hecho, y sin confirmación. Es la lectura más simple, no una decisión de producto confirmada.
- **Choque de ediciones (PA-8).** Gana el último cambio; no hay aviso de conflicto.
- **Tareas «En curso» por persona (PA-4).** Sin límite.
