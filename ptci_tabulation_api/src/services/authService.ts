import bcrypt from 'bcryptjs'
import * as jose from 'jose'
import { z } from 'zod'
import { env } from '../config/env.js'
import { unauthorized, unprocessable } from '../lib/httpError.js'
import { validate } from '../lib/validate.js'
import { findUserById, findUserByUsername, setHasSubmitted } from '../repositories/userRepository.js'
import type { UserData, UserRecord, UserRole } from '../types/index.js'

const BCRYPT_ROUNDS = 12
// Used when the username does not exist so a failed login costs the same time either way.
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5b1lDHfjPK9sFEqXbP0FTWqKqXlF2Ue'

const jwtSecret = () => new TextEncoder().encode(env.jwt.secret)

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(64),
  password: z.string().min(1, 'Password is required').max(256),
})

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(64)
  .regex(/^[a-z0-9._-]+$/, 'Username may only contain letters, numbers, dots, hyphens, and underscores')

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(256)

export function toUserData(user: UserRecord): UserData {
  return { id: String(user.id), username: user.username, role: user.role, has_submitted: user.hasSubmitted }
}

export const redirectFor = (role: UserRole): string => (role === 'admin' ? '/dashboard' : '/judge')

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Validate credentials. Throws 422 on malformed input and 401 on bad
 * credentials (the frontend shows "Invalid username or password." for 401/422).
 */
export async function login(input: unknown): Promise<UserRecord> {
  const { username, password } = validate(loginSchema, input)
  const user = await findUserByUsername(username)
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !ok) throw unauthorized('Invalid username or password.')
  if (!user.isActive) throw unauthorized('This account has been deactivated.')
  return user
}

export async function signSessionToken(user: UserRecord): Promise<string> {
  return new jose.SignJWT({ username: user.username, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(env.jwt.expiresIn)
    .sign(jwtSecret())
}

/** Verify the session JWT and load the *current* user row (so deletions/deactivations take effect immediately). */
export async function resolveSession(token: string | undefined): Promise<UserRecord> {
  if (!token) throw unauthorized('No active session.')
  let userId: number
  let issuedAt = 0
  try {
    const { payload } = await jose.jwtVerify(token, jwtSecret(), { algorithms: ['HS256'] })
    userId = Number(payload.sub)
    issuedAt = Number(payload.iat ?? 0)
    if (!Number.isInteger(userId) || userId <= 0) throw new Error('bad subject')
  } catch {
    throw unauthorized('Session expired or invalid. Please log in again.')
  }
  const user = await findUserById(userId)
  if (!user || !user.isActive) throw unauthorized('Session is no longer valid. Please log in again.')
  // A password reset revokes every session issued before it (iat is in whole seconds).
  if (user.passwordChangedAt && issuedAt * 1000 < Date.parse(user.passwordChangedAt) - 999) {
    throw unauthorized('Your password was changed. Please log in again.')
  }
  return user
}

export async function markHasSubmitted(user: UserRecord, value = true): Promise<UserRecord> {
  await setHasSubmitted(user.id, value)
  const fresh = await findUserById(user.id)
  if (!fresh) throw unprocessable('User no longer exists.')
  return fresh
}

/** "12h" | "1d" | "7d" | "30m" | "3600" (seconds) → seconds, for the cookie maxAge. */
export function expiresInSeconds(spec: string = env.jwt.expiresIn): number {
  const m = /^(\d+)\s*([smhdw]?)$/i.exec(spec.trim())
  if (!m) return 60 * 60 * 24
  const n = Number(m[1])
  const unit = (m[2] ?? '').toLowerCase()
  const mult: Record<string, number> = { '': 1, s: 1, m: 60, h: 3600, d: 86400, w: 604800 }
  return n * (mult[unit] ?? 1)
}
