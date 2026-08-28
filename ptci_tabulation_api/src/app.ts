import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyInstance } from 'fastify'
import { env } from './config/env.js'
import { registerErrorHandler } from './plugins/errorHandler.js'
import { activityLogRoutes } from './routes/activityLogs.js'
import { authRoutes } from './routes/auth.js'
import { contestantRoutes } from './routes/contestants.js'
import { healthRoutes } from './routes/health.js'
import { scoreRoutes } from './routes/scores.js'
import { userRoutes } from './routes/users.js'

export type BuildAppOptions = {
  logger?: boolean
}

/** Assemble the Fastify app (no listen) — used by index.ts and by the API tests via `app.inject()`. */
export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? true,
    // Hostinger/Render sit behind a reverse proxy — needed for request.ip and https detection.
    // Scoped via TRUST_PROXY (default: private/loopback peers only) so clients can't spoof X-Forwarded-For.
    trustProxy: env.trustProxy,
  })

  // Accept empty bodies on application/json requests (the frontend posts check-session
  // and PUTs has-submitted with no body) instead of failing with FST_ERR_CTP_EMPTY_JSON_BODY.
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    if (body === '' || body == null) {
      done(null, undefined)
      return
    }
    try {
      done(null, JSON.parse(body as string))
    } catch {
      const err = new Error('Invalid JSON body') as Error & { statusCode?: number }
      err.statusCode = 400
      done(err, undefined)
    }
  })

  registerErrorHandler(app)

  await app.register(cookie)
  // Opt-in per route. Runs at preHandler so route keyGenerators can read the parsed body
  // (the login limit is keyed by username, not IP — see routes/auth.ts).
  await app.register(rateLimit, { global: false, hook: 'preHandler' })
  await app.register(cors, {
    origin: (origin, callback) => {
      // Non-browser clients (curl, health checks) omit Origin — allow them.
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      const err = new Error(`CORS: origin not allowed: ${origin}`) as Error & { statusCode?: number }
      err.statusCode = 403
      callback(err, false)
    },
    credentials: true, // the session cookie rides on every request (axios withCredentials: true)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Friendly landing page for https://api.<domain>/ so the subdomain doesn't answer 404 in a browser.
  app.get('/', async () => ({
    service: 'ic2-tabulation-api',
    ok: true,
    docs: 'See docs/API.md in the repository',
    health: '/health',
    api: '/api',
  }))

  await app.register(healthRoutes)

  await app.register(authRoutes, { prefix: '/api' })
  await app.register(contestantRoutes, { prefix: '/api' })
  await app.register(scoreRoutes, { prefix: '/api' })
  await app.register(userRoutes, { prefix: '/api' })
  await app.register(activityLogRoutes, { prefix: '/api' })

  return app
}
