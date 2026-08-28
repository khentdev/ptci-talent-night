import type { FastifyPluginAsync } from 'fastify'
import { testMysqlConnection } from '../db/pool.js'

export const healthRoutes: FastifyPluginAsync = async (app) => {
  // 200 when MySQL answers, 503 otherwise — so Hostinger/Render health checks actually fail
  // (and restart/alert) when the database goes away after boot.
  app.get('/health', async (_request, reply) => {
    let mysql: 'ok' | 'error' = 'ok'
    try {
      await testMysqlConnection()
    } catch {
      mysql = 'error'
    }
    return reply.status(mysql === 'ok' ? 200 : 503).send({
      ok: mysql === 'ok',
      service: 'ic2-tabulation-api',
      timestamp: new Date().toISOString(),
      mysql,
    })
  })
}
