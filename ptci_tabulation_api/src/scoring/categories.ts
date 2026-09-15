/**
 * Single source of truth for every judged category: its DB table, the
 * criteria a judge submits (request-body key → column), and the maximum
 * points per criterion. Maxima mirror the frontend's SCORE_CRITERIA so the
 * API rejects anything the UI could not have produced. Every category sums
 * to 100.
 */
export const CATEGORY_KEYS = ['talent'] as const

export type CategoryKey = (typeof CATEGORY_KEYS)[number]

export type Criterion = {
  /** Key in the JSON body sent by the frontend. */
  bodyKey: string
  /** Column name in the category's scores table. */
  column: string
  max: number
}

export type CategoryConfig = {
  key: CategoryKey
  table: string
  label: string
  criteria: readonly Criterion[]
  /** Which user roles may submit this category. */
  submitRoles: readonly ('admin' | 'judge')[]
}

const c = (bodyKey: string, max: number, column = bodyKey): Criterion => ({ bodyKey, column, max })

export const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  talent: {
    key: 'talent',
    table: 'scores_talent',
    label: 'Talent',
    criteria: [
      c('mastery', 30),
      c('performance_choreography', 40),
      c('overall_impression', 20),
      c('audience_impact', 10),
    ],
    submitRoles: ['judge'],
  },
}

export function isCategoryKey(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(value)
}
