/**
 * Single source of truth for every judged category: its DB table, the
 * criteria a judge submits (request-body key → column), and the maximum
 * points per criterion. Maxima mirror the frontend's SCORE_CRITERIA so the
 * API rejects anything the UI could not have produced. Every category sums
 * to 100.
 */
export const CATEGORY_KEYS = [
  'production',
  'uniform',
  'swimwear',
  'formalwear',
  'qna',
  'talent',
  'top-five',
] as const

export type CategoryKey = (typeof CATEGORY_KEYS)[number]

export type Criterion = {
  /** Key in the JSON body sent by the frontend (may contain "/" for legacy names). */
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
  /**
   * Categories that count toward the preliminary overall score used to pick the
   * Top 5 finalists. `top-five` itself is the finals round and is excluded.
   */
  preliminary: boolean
}

const c = (bodyKey: string, max: number, column = bodyKey): Criterion => ({ bodyKey, column, max })

export const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  production: {
    key: 'production',
    table: 'scores_production',
    label: 'Production Number',
    criteria: [c('choreography', 40), c('projection', 40), c('audience_impact', 20)],
    submitRoles: ['judge'],
    preliminary: true,
  },
  uniform: {
    key: 'uniform',
    table: 'scores_uniform',
    label: 'Uniform',
    criteria: [
      c('poise_and_bearings', 40),
      c('personality_and_projection', 30),
      c('neatness', 20),
      c('overall_impact', 10),
    ],
    submitRoles: ['judge'],
    preliminary: true,
  },
  swimwear: {
    key: 'swimwear',
    table: 'scores_swimwear',
    label: 'Swimwear',
    criteria: [
      c('stage_presence', 40),
      c('figure_and_fitness', 30),
      c('poise_and_bearing', 20),
      c('overall_impact', 10),
    ],
    submitRoles: ['judge'],
    preliminary: true,
  },
  formalwear: {
    key: 'formalwear',
    table: 'scores_formalwear',
    label: 'Formal Wear',
    // The frontend still posts the legacy slash-keys; map them to sane columns.
    criteria: [
      c('poise_and_bearing', 40),
      c('personality/projection', 30, 'personality_projection'),
      c('appropriateness/ellegance', 20, 'appropriateness_elegance'),
      c('overall_impact', 10),
    ],
    submitRoles: ['judge'],
    preliminary: true,
  },
  qna: {
    key: 'qna',
    table: 'scores_qna',
    label: 'Question and Answer',
    criteria: [c('total_score', 100, 'qna_score')],
    submitRoles: ['judge'],
    preliminary: true,
  },
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
    preliminary: true,
  },
  'top-five': {
    key: 'top-five',
    table: 'scores_top_five',
    label: 'Top 5 Finals',
    criteria: [c('qna', 50), c('beauty', 50)],
    submitRoles: ['judge'],
    preliminary: false,
  },
}

export const PRELIMINARY_CATEGORIES = CATEGORY_KEYS.map((k) => CATEGORIES[k]).filter((cat) => cat.preliminary)

export function isCategoryKey(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(value)
}
