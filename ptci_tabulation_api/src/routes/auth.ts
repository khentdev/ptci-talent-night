import type { FastifyPluginAsync } from 'fastify'
import { env } from '../config/env.js'
import { authenticate, clearSessionCookie, setSessionCookie } from '../plugins/auth.js'
import { logActivity } from '../services/activityService.js'
import { login, markHasSubmitted, redirectFor, resolveSession, signSessionToken, toUserData } from '../services/authService.js'

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/auth/login  { username, password }
  //  → 200 { status, loggedIn, user: { id, username, role, has_submitted }, redirect } + session cookie
  //  → 401/422 { status, message }
  //  Brute-force guard keyed by USERNAME (not IP): a whole venue shares one public IP, and
  //  X-Forwarded-For can be forged, so per-IP limits either lock everyone out or protect nothing.
  app.post(
    '/auth/login',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '15 minutes',
          keyGenerator: (request) => {
            const username = (request.body as { username?: unknown } | undefined)?.username
            return `login:${String(username ?? '').trim().toLowerCase()}`
          },
        },
      },
    },
    async (request, reply) => {
      const user = await login(request.body)
      const token = await signSessionToken(user)
      setSessionCookie(reply, token)
      logActivity(request, 'auth.login', `${user.role} signed in`, user)
      return { status: 200, loggedIn: true, user: toUserData(user), redirect: redirectFor(user.role) }
    },
  )

  // POST /api/auth/check-session → 200 { status, loggedIn, user } | 401
  app.post('/auth/check-session', { preHandler: [authenticate] }, async (request) => {
    return { status: 200, loggedIn: true, user: toUserData(request.user!) }
  })

  // GET /api/auth/me — same payload as check-session, handy for curl/debugging
  app.get('/auth/me', { preHandler: [authenticate] }, async (request) => {
    return { status: 200, loggedIn: true, user: toUserData(request.user!) }
  })

  // POST /api/auth/logout → clears the cookie (always 200, even without a session)
  app.post('/auth/logout', async (request, reply) => {
    try {
      const user = await resolveSession(request.cookies[env.cookie.name])
      logActivity(request, 'auth.logout', '', user)
    } catch {
      /* no valid session — nothing to log */
    }
    clearSessionCookie(reply)
    return { status: 200, loggedIn: false, message: 'Logged out.' }
  })

  // PUT /api/auth/has-submitted → { status: "success", message, has_submitted: true }
  app.put('/auth/has-submitted', { preHandler: [authenticate] }, async (request) => {
    const updated = await markHasSubmitted(request.user!, true)
    logActivity(request, 'auth.has_submitted', 'marked scores as submitted')
    return { status: 'success', message: 'Submission recorded.', has_submitted: updated.hasSubmitted }
  })
}
