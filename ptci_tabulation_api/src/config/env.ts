import 'dotenv/config'

const isProd = process.env.NODE_ENV === 'production'

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '' || value.trim().toLowerCase() === 'auto') return fallback
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

function sameSite(value: string | undefined, fallback: 'lax' | 'none' | 'strict'): 'lax' | 'none' | 'strict' {
  const v = value?.trim().toLowerCase()
  if (v === 'lax' || v === 'none' || v === 'strict') return v
  return fallback
}

const LOCAL_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]

/**
 * Which upstream proxies may set X-Forwarded-* (client IP, https detection).
 *   'true'                → trust every hop (unsafe: clients can spoof their IP)
 *   'false'               → trust nothing (fine when clients connect directly)
 *   CIDRs / keywords      → e.g. 'loopback, linklocal, uniquelocal' (default: the reverse
 *                           proxy sits on the same host or a private network — Hostinger, Render, nginx)
 * Note: Fastify treats a bare hop *count* as "trust nothing", so we never pass a number.
 */
function trustProxy(value: string | undefined): boolean | string {
  const v = value?.trim()
  if (!v || v.toLowerCase() === 'auto') return 'loopback, linklocal, uniquelocal'
  if (v.toLowerCase() === 'true') return true
  if (v.toLowerCase() === 'false') return false
  return v
}

const PLACEHOLDER_SECRET = /change-me|changeme|replace-me|your-secret|example|placeholder/i

export const env = {
  isProd,
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST?.trim() || '0.0.0.0',
  trustProxy: trustProxy(process.env.TRUST_PROXY),

  // Local Vite origins are only whitelisted outside production — in production a
  // credentialed CORS grant to http://localhost would let any local process reuse
  // an admin's session cookie.
  corsOrigins: Array.from(
    new Set(
      (process.env.CORS_ORIGIN ?? '')
        .split(',')
        .map((o) => o.trim().replace(/\/+$/, ''))
        .filter(Boolean)
        .concat(isProd ? [] : LOCAL_DEV_ORIGINS),
    ),
  ),

  mysql: {
    host: process.env.MYSQL_HOST?.trim() || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER?.trim() || 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE?.trim() || 'ic2_tabulation',
    ssl: bool(process.env.MYSQL_SSL, false),
  },

  jwt: {
    secret: process.env.JWT_SECRET?.trim() ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN?.trim() || '1d',
  },

  cookie: {
    name: process.env.COOKIE_NAME?.trim() || 'ic2_token',
    secure: bool(process.env.COOKIE_SECURE, isProd),
    sameSite: sameSite(process.env.COOKIE_SAME_SITE, isProd ? 'none' : 'lax'),
    domain: process.env.COOKIE_DOMAIN?.trim() || undefined,
  },
} as const

/** Fail fast on misconfiguration instead of serving broken auth. */
export function assertEnv(): void {
  const problems: string[] = []
  if (env.jwt.secret.length < 32) problems.push('JWT_SECRET must be at least 32 characters')
  else if (PLACEHOLDER_SECRET.test(env.jwt.secret))
    problems.push('JWT_SECRET looks like a placeholder — generate a random one (see .env.example)')
  if (env.isProd && env.corsOrigins.length === 0) problems.push('CORS_ORIGIN must list the frontend origin in production')
  if (!env.mysql.database) problems.push('MYSQL_DATABASE is required')
  if (env.cookie.sameSite === 'none' && !env.cookie.secure)
    problems.push('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true (browsers reject it otherwise)')
  if (problems.length) {
    throw new Error(`Invalid environment:\n - ${problems.join('\n - ')}`)
  }
}
