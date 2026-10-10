import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

/**
 * Día de calendario (`YYYY-MM-DD`) respecto al que se evalúa el vencimiento:
 * el de la cabecera `X-Client-Date` si es una fecha válida; si falta o no lo
 * es, la fecha local del servidor.
 */
export function referenceDay({ request }: Pick<HttpContext, 'request'>): string {
  const header = request.header('x-client-date')

  if (typeof header === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(header)) {
    const parsed = DateTime.fromISO(header)
    if (parsed.isValid && parsed.toISODate() === header) {
      return header
    }
  }

  return DateTime.local().toISODate()
}
