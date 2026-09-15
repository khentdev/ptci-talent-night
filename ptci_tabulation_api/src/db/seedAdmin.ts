/**
 * Seed ONLY the admin account — no judges, no sample contestants. Safe for production.
 *
 *   npm run seed:admin                                  # compiled (dist/), plain node — use this over SSH
 *   npm run seed:admin -- --admin=admin:Secret123       # explicit credentials
 *   npm run seed:admin:dev                              # same, from src/ via tsx
 *
 * Reads SEED_ADMIN_USERNAME (default "admin") / SEED_ADMIN_PASSWORD and MYSQL_* from the
 * environment or a .env in the working directory. Idempotent: an existing username is left untouched.
 */
import { hashPassword } from '../services/authService.js'
import { createUser, findUserByUsername } from '../repositories/userRepository.js'
import { initDatabaseSchema } from './initSchema.js'
import { closePool } from './pool.js'

function arg(name: string): string | undefined {
  const prefix = `--${name}=`
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length)
}

async function main(): Promise<void> {
  let username = process.env.SEED_ADMIN_USERNAME?.trim() || 'admin'
  let password = process.env.SEED_ADMIN_PASSWORD?.trim() || ''
  const adminArg = arg('admin')
  if (adminArg) {
    const [u, ...rest] = adminArg.split(':')
    username = u?.trim() || username
    password = rest.join(':')
  }
  if (password.length < 8) {
    throw new Error('Set SEED_ADMIN_PASSWORD (or --admin=username:password) — at least 8 characters')
  }

  await initDatabaseSchema()

  if (await findUserByUsername(username)) {
    console.log(`admin "${username}": exists (unchanged)`)
    return
  }
  await createUser({ username, passwordHash: await hashPassword(password), role: 'admin' })
  console.log(`admin "${username}": created`)
}

main()
  .then(() => closePool())
  .catch(async (err) => {
    console.error('Seed failed:', err instanceof Error ? err.message : err)
    await closePool()
    process.exit(1)
  })
