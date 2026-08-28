import { z } from 'zod'
import { forbidden, notFound, unprocessable } from '../lib/httpError.js'
import { validate } from '../lib/validate.js'
import { findContestantById } from '../repositories/contestantRepository.js'
import { insertScore } from '../repositories/scoreRepository.js'
import { CATEGORIES, type CategoryConfig, type CategoryKey } from '../scoring/categories.js'
import type { UserRecord } from '../types/index.js'

const round2 = (n: number) => Math.round(n * 100) / 100

/** Accepts 8, "8", 8.5, "8.50" — at most two decimals, within [0, max]. */
const scoreValue = (max: number) =>
  z.coerce
    .number({ message: 'Score must be a number' })
    .min(0, 'Score cannot be negative')
    .max(max, `Score cannot exceed ${max}`)
    .refine((n) => Number.isFinite(n) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-9, {
      message: 'Score may have at most two decimal places',
    })

const schemaCache = new Map<CategoryKey, z.ZodType<Record<string, unknown>>>()

/** Build (once) the zod schema for a category from its criteria config. */
export function scoreBodySchema(cat: CategoryConfig): z.ZodType<Record<string, unknown>> {
  const cached = schemaCache.get(cat.key)
  if (cached) return cached
  const shape: Record<string, z.ZodType> = {
    cand_id: z.coerce.number().int('Invalid candidate').positive('Invalid candidate'),
  }
  for (const c of cat.criteria) shape[c.bodyKey] = scoreValue(c.max)
  const schema = z.object(shape)
  schemaCache.set(cat.key, schema)
  return schema
}

export type SubmitScoreResult = {
  status: number
  message: string
  score_id: number
  total_score: string
  has_submitted: boolean
}

/**
 * Validate and persist one judge's score for one candidate in a category.
 * 403 wrong role · 404 unknown candidate · 422 invalid values or duplicate.
 */
export async function submitScore(category: CategoryKey, judge: UserRecord, body: unknown): Promise<SubmitScoreResult> {
  const cat = CATEGORIES[category]
  if (!cat.submitRoles.includes(judge.role)) throw forbidden('Only judges can submit scores.')

  const input = validate(scoreBodySchema(cat), body) as Record<string, number>
  const candId = input.cand_id as number

  const contestant = await findContestantById(candId)
  if (!contestant) throw notFound('Contestant not found.')

  const values: Record<string, number> = {}
  let total = 0
  for (const c of cat.criteria) {
    const v = round2(input[c.bodyKey] ?? 0)
    values[c.column] = v
    total += v
  }
  total = round2(total)

  const inserted = await insertScore({ category, judgeId: judge.id, candId, values, total })
  if (inserted === 'duplicate') {
    throw unprocessable(`You have already submitted a ${cat.label} score for candidate #${contestant.candNumber}.`)
  }

  // `has_submitted` is reported, never flipped here: the frontend fires one request per
  // candidate, and locking the account on the first success would strand the rest of the
  // batch after a partial failure/reload. Only PUT /auth/has-submitted sets the flag.
  return {
    status: 200,
    message: `${cat.label} score for candidate #${contestant.candNumber} submitted successfully.`,
    score_id: inserted,
    total_score: total.toFixed(2),
    has_submitted: judge.hasSubmitted,
  }
}
