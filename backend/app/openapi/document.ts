import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import openapi from '@foadonis/openapi/services/main'

/**
 * Dónde vive la copia versionada del contrato, relativa a la raíz del
 * repositorio (no a `backend/`): `docs/` es de todo el monorepo. Es una función
 * y no una constante porque ace importa los comandos para leer sus metadatos
 * antes de arrancar la app, y entonces `app.makePath` aún no tiene raíz.
 */
export function openAPIDocumentPath(): string {
  return app.makePath('..', 'docs', 'api', 'openapi.json')
}

/**
 * Construye el mismo documento que se sirve en `/api.json` y lo devuelve ya
 * serializado tal y como se escribe en disco.
 *
 * `@foadonis/openapi` recorre `router.toJSON()`, que solo tiene rutas una vez
 * hecho el `commit()`: en el servidor lo hace el arranque HTTP, aquí no lo hace
 * nadie más. El formato (dos espacios y salto de línea final) es parte del
 * contrato del fichero: `openapi:check` compara texto, y cualquier otro formato
 * lo daría por desincronizado.
 */
export async function buildOpenAPIDocument(): Promise<string> {
  router.commit()
  const document = await openapi.buildDocument()
  return JSON.stringify(document, null, 2) + '\n'
}
