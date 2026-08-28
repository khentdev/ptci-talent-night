import type { FastifyPluginAsync } from 'fastify'
import { notFound } from '../lib/httpError.js'
import { validate } from '../lib/validate.js'
import { authenticate, requireRole } from '../plugins/auth.js'
import { CATEGORIES, CATEGORY_KEYS, isCategoryKey, type CategoryKey } from '../scoring/categories.js'
import { logActivity } from '../services/activityService.js'
import { genderQuerySchema } from '../services/contestantService.js'
import { candidateFinals, judgeScoresGrouped, overallStandings, topFiveCandidates } from '../services/scoreboardService.js'
import { submitScore } from '../services/scoreService.js'

function categoryParam(params: unknown): CategoryKey {
  const value = String((params as { category?: string })?.category ?? '')
  if (!isCategoryKey(value)) {
    throw notFound(`Unknown category "${value}". Valid categories: ${CATEGORY_KEYS.join(', ')}.`)
  }
  return value
}

export const scoreRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/scores/categories → the criteria/max config (handy for the UI and for debugging)
  app.get('/scores/categories', { preHandler: [authenticate] }, async () => ({
    status: 200,
    message: 'Categories fetched successfully.',
    data: CATEGORY_KEYS.map((key) => ({
      key,
      label: CATEGORIES[key].label,
      preliminary: CATEGORIES[key].preliminary,
      criteria: CATEGORIES[key].criteria.map((c) => ({ key: c.bodyKey, max: c.max })),
    })),
  }))

  // GET /api/scores/top-five/candidates → the 5 best male + 5 best female by preliminary standing
  //   (judges need this to score the finals; admins to review)
  app.get('/scores/top-five/candidates', { preHandler: [authenticate] }, async () => {
    const data = await topFiveCandidates(5)
    return { status: 200, message: 'Top 5 candidates fetched successfully.', data }
  })

  // GET /api/scores/overall[?gender=] → every candidate's preliminary standing (admin)
  app.get('/scores/overall', { preHandler: [requireRole('admin')] }, async (request) => {
    const { gender } = validate(genderQuerySchema, request.query)
    const data = await overallStandings(gender)
    return { status: 200, message: 'Overall standings fetched successfully.', data }
  })

  // POST /api/scores/:category  { cand_id, ...criteria }  (judge)
  //   → 200 { status, message, score_id, total_score, has_submitted }
  //   → 404 unknown category/candidate · 422 invalid value or already scored
  app.post('/scores/:category', { preHandler: [authenticate] }, async (request) => {
    const category = categoryParam(request.params)
    const result = await submitScore(category, request.user!, request.body)
    logActivity(request, 'score.submit', `${category} cand_id=${(request.body as { cand_id?: unknown })?.cand_id} total=${result.total_score}`)
    return result
  })

  // GET /api/scores/:category/judges[?gender=] → { data: { "<judge_id>": rows[] } } (admin)
  app.get('/scores/:category/judges', { preHandler: [requireRole('admin')] }, async (request) => {
    const category = categoryParam(request.params)
    const { gender } = validate(genderQuerySchema, request.query)
    const data = await judgeScoresGrouped(category, gender)
    return { status: 200, message: `${CATEGORIES[category].label} judge scores fetched successfully.`, data }
  })

  // GET /api/scores/:category/final[?gender=] → per-candidate averages, best first (admin)
  app.get('/scores/:category/final', { preHandler: [requireRole('admin')] }, async (request) => {
    const category = categoryParam(request.params)
    const { gender } = validate(genderQuerySchema, request.query)
    const data = await candidateFinals(category, gender)
    return { status: 200, message: `${CATEGORIES[category].label} final scores fetched successfully.`, data }
  })
}
