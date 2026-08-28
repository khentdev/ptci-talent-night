import type { ZodType } from 'zod'
import { unprocessable } from './httpError.js'

/**
 * Parse `input` with a zod schema. On failure throws a 422 HttpError whose
 * message is the first issue, formatted as "field: problem" so the frontend
 * can toast it directly.
 */
export function validate<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (result.success) return result.data

  const issue = result.error.issues[0]
  const path = issue?.path?.length ? `${issue.path.map(String).join('.')}: ` : ''
  throw unprocessable(`${path}${issue?.message ?? 'Invalid request'}`)
}
