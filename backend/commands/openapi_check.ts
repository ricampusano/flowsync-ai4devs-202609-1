import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { buildOpenAPIDocument, openAPIDocumentPath } from '#openapi/document'

/**
 * Cuántas diferencias se listan como mucho. Pasado ese número, el detalle deja
 * de ayudar: lo que hay que hacer es regenerar y mirar el diff en git.
 */
const MAX_REPORTED_DIFFERENCES = 50

type Difference = { pointer: string; kind: 'añadido' | 'eliminado' | 'cambiado'; detail: string }

/**
 * Comprueba que `docs/api/openapi.json` coincide con lo que el código
 * construye hoy. Regenera el documento en un directorio temporal y compara;
 * nunca escribe sobre el fichero versionado, eso es cosa de `openapi:generate`.
 */
export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description =
    'Comprueba que docs/api/openapi.json coincide con el documento OpenAPI que genera el código'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const versionedPath = relative(this.app.makePath('..'), openAPIDocumentPath())

    let versioned: string
    try {
      versioned = await readFile(openAPIDocumentPath(), 'utf8')
    } catch {
      this.logger.error(`No existe ${versionedPath}. Ejecuta "npm run openapi:generate".`)
      this.exitCode = 1
      return
    }

    const tempDir = await mkdtemp(join(tmpdir(), 'flowsync-openapi-'))
    let generated: string
    try {
      const tempPath = join(tempDir, 'openapi.json')
      await writeFile(tempPath, await buildOpenAPIDocument())
      generated = await readFile(tempPath, 'utf8')
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }

    if (generated === versioned) {
      this.logger.success(`${versionedPath} está al día`)
      return
    }

    this.exitCode = 1
    this.logger.error(`${versionedPath} no coincide con el documento que genera el código.`)

    let versionedJson: unknown
    try {
      versionedJson = JSON.parse(versioned)
    } catch (error) {
      this.logger.error(`El fichero versionado no es JSON válido: ${(error as Error).message}`)
      this.logger.info('Ejecuta "npm run openapi:generate" y commitea el resultado.')
      return
    }

    const differences = diff(versionedJson, JSON.parse(generated), '')
    if (differences.length === 0) {
      this.logger.error(
        'El contenido es el mismo, pero no el texto: el fichero se ha editado a mano ' +
          '(formato, orden de claves o salto de línea final).'
      )
    } else {
      this.logger.error(`${differences.length} diferencia(s), del versionado al generado:`)
      for (const { pointer, kind, detail } of differences.slice(0, MAX_REPORTED_DIFFERENCES)) {
        this.logger.log(`  ${kind.padEnd(9)} ${pointer || '/'}  ${detail}`)
      }
      if (differences.length > MAX_REPORTED_DIFFERENCES) {
        this.logger.log(`  … y ${differences.length - MAX_REPORTED_DIFFERENCES} más`)
      }
    }
    this.logger.info('Ejecuta "npm run openapi:generate" y commitea el resultado.')
  }
}

/**
 * Diferencias entre dos valores JSON, cada una con su JSON Pointer (RFC 6901).
 * Los arrays se comparan por posición, que es como los compara el texto.
 */
function diff(before: unknown, after: unknown, pointer: string): Difference[] {
  if (isContainer(before) && isContainer(after) && Array.isArray(before) === Array.isArray(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])
    return [...keys].flatMap((key) => {
      const child = `${pointer}/${key.replaceAll('~', '~0').replaceAll('/', '~1')}`
      const b = (before as Record<string, unknown>)[key]
      const a = (after as Record<string, unknown>)[key]
      if (!(key in before))
        return [{ pointer: child, kind: 'añadido' as const, detail: preview(a) }]
      if (!(key in after))
        return [{ pointer: child, kind: 'eliminado' as const, detail: preview(b) }]
      return diff(b, a, child)
    })
  }
  if (JSON.stringify(before) === JSON.stringify(after)) return []
  return [{ pointer, kind: 'cambiado', detail: `${preview(before)} → ${preview(after)}` }]
}

function isContainer(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

function preview(value: unknown): string {
  const text = JSON.stringify(value)
  return text.length > 80 ? `${text.slice(0, 77)}...` : text
}
