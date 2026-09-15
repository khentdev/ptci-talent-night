import type { FastifyPluginAsync } from 'fastify'
import { notFound } from '../lib/httpError.js'
import { validate } from '../lib/validate.js'
import { authenticate, requireRole } from '../plugins/auth.js'
import { CATEGORIES, CATEGORY_KEYS, isCategoryKey, type CategoryKey } from '../scoring/categories.js'
import { logActivity } from '../services/activityService.js'
import { genderQuerySchema } from '../services/contestantService.js'
import { candidateFinals, judgeScoresGrouped, myJudgeScores } from '../services/scoreboardService.js'
import { submitScore, submitScoresBatch } from '../services/scoreService.js'

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
      criteria: CATEGORIES[key].criteria.map((c) => ({ key: c.bodyKey, max: c.max })),
    })),
  }))

  // POST /api/scores/:category  { cand_id, ...criteria }  (judge)
  //   → 200 { status, message, score_id, total_score, has_submitted }
  //   → 404 unknown category/candidate · 422 invalid value or already scored
  app.post('/scores/:category', { preHandler: [authenticate] }, async (request) => {
    const category = categoryParam(request.params)
    const result = await submitScore(category, request.user!, request.body)
    logActivity(request, 'score.submit', `${category} cand_id=${(request.body as { cand_id?: unknown })?.cand_id} total=${result.total_score}`)
    return result
  })

  // POST /api/scores/:category/batch  [{ cand_id, ...criteria }, ...]  (judge)
  //   → 200 { status, message, results, has_submitted } — atomic: all rows inserted and
  //     has_submitted set in one transaction, or nothing is written.
  //   → 404 unknown category/candidate · 422 invalid value or already scored (rolls back everything)
  app.post('/scores/:category/batch', { preHandler: [authenticate] }, async (request) => {
    const category = categoryParam(request.params)
    const result = await submitScoresBatch(category, request.user!, request.body)
    logActivity(request, 'score.submit_batch', `${category} count=${result.results.length}`)
    return result
  })

  // GET /api/scores/:category/mine[?gender=] → { data: rows[] } — the current user's own submitted rows
  app.get('/scores/:category/mine', { preHandler: [authenticate] }, async (request) => {
    const category = categoryParam(request.params)
    const { gender } = validate(genderQuerySchema, request.query)
    const data = await myJudgeScores(category, request.user!.id, gender)
    return { status: 200, message: `${CATEGORIES[category].label} scores fetched successfully.`, data }
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
