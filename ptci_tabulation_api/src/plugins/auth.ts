import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../config/env.js'
import { forbidden } from '../lib/httpError.js'
import { expiresInSeconds, resolveSession } from '../services/authService.js'
import type { UserRecord, UserRole } from '../types/index.js'

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by `authenticate` — the signed-in user, freshly loaded from MySQL. */
    user?: UserRecord
  }
}

/** preHandler: require a valid session cookie; attaches `request.user`. Throws 401 otherwise. */
export async function authenticate(request: FastifyRequest): Promise<void> {
  request.user = await resolveSession(request.cookies[env.cookie.name])
}

/** preHandler factory: `authenticate` first, then check the role. Throws 403. */
export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest): Promise<void> => {
    if (!request.user) await authenticate(request)
    if (!roles.includes(request.user!.role)) {
      throw forbidden(`This action requires role: ${roles.join(' or ')}.`)
    }
  }
}

const cookieBase = () => ({
  path: '/',
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  ...(env.cookie.domain ? { domain: env.cookie.domain } : {}),
})

export function setSessionCookie(reply: FastifyReply, token: string): void {
  reply.setCookie(env.cookie.name, token, { ...cookieBase(), maxAge: expiresInSeconds() })
}

export function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(env.cookie.name, cookieBase())
}
