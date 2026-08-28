import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { validate } from '../lib/validate.js'
import { requireRole } from '../plugins/auth.js'
import { getActivityLogs } from '../services/activityService.js'

const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(1000).optional() })

export const activityLogRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/activity-logs[?limit=200]  (admin) — newest first
  app.get('/activity-logs', { preHandler: [requireRole('admin')] }, async (request) => {
    const { limit } = validate(querySchema, request.query)
    const data = await getActivityLogs(limit)
    return { status: 200, message: 'Activity logs fetched successfully.', data }
  })
}
