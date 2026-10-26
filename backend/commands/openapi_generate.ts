import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import { buildOpenAPIDocument, openAPIDocumentPath } from '#openapi/document'

/**
 * Escribe en `docs/api/openapi.json` el documento que el servidor construye en
 * cada petición a `/api.json`, para que el contrato exista en el repositorio y
 * no solo mientras el servidor corre.
 */
export default class OpenapiGenerate extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = 'Genera el documento OpenAPI y lo escribe en docs/api/openapi.json'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const document = await buildOpenAPIDocument()
    await mkdir(dirname(openAPIDocumentPath()), { recursive: true })
    await writeFile(openAPIDocumentPath(), document)
    this.logger.success(
      `Documento escrito en ${relative(this.app.makePath('..'), openAPIDocumentPath())}`
    )
  }
}
