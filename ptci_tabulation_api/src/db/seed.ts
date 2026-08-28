/**
 * Seed accounts (and optionally sample contestants).
 *
 *   npm run seed                              # uses SEED_* from .env
 *   npm run seed -- --admin=admin:Secret123   # explicit admin credentials
 *   npm run seed -- --judges=5 --judge-password=Judge1234 --sample
 *
 * Idempotent: existing usernames are skipped, sample contestants are only
 * inserted when the contestants table is empty. If no admin password is
 * given and no admin exists yet, a random one is generated and printed ONCE.
 */
import { randomBytes } from 'node:crypto'
import { hashPassword } from '../services/authService.js'
import { countContestants, createContestant } from '../repositories/contestantRepository.js'
import { createUser, findUserByUsername } from '../repositories/userRepository.js'
import type { Gender, Team } from '../types/index.js'
import { initDatabaseSchema } from './initSchema.js'
import { closePool } from './pool.js'

function arg(name: string): string | undefined {
  const prefix = `--${name}=`
  const hit = process.argv.find((a) => a.startsWith(prefix))
  if (hit) return hit.slice(prefix.length)
  return process.argv.includes(`--${name}`) ? 'true' : undefined
}

const TEAMS: Team[] = ['red', 'yellow', 'green', 'purple', 'blue']
const SAMPLE_MALES = ['Juan Dela Cruz', 'Miguel Santos', 'Carlo Reyes', 'Paolo Garcia', 'Rafael Mendoza', 'Gabriel Torres', 'Marco Villanueva', 'Enzo Bautista', 'Andres Ramos', 'Luis Fernandez']
const SAMPLE_FEMALES = ['Maria Clara', 'Andrea Santos', 'Bianca Reyes', 'Sofia Garcia', 'Isabella Mendoza', 'Angela Torres', 'Camille Villanueva', 'Nicole Bautista', 'Patricia Ramos', 'Katrina Fernandez']

async function ensureUser(username: string, password: string, role: 'admin' | 'judge'): Promise<'created' | 'exists'> {
  if (await findUserByUsername(username)) return 'exists'
  await createUser({ username, passwordHash: await hashPassword(password), role })
  return 'created'
}

async function seedSampleContestants(): Promise<number> {
  if ((await countContestants()) > 0) return 0
  let n = 0
  const insert = async (names: string[], gender: Gender) => {
    for (let i = 0; i < names.length; i++) {
      await createContestant({ candNumber: String(i + 1), candName: names[i]!, candTeam: TEAMS[i % TEAMS.length]!, candGender: gender })
      n++
    }
  }
  await insert(SAMPLE_MALES, 'male')
  await insert(SAMPLE_FEMALES, 'female')
  return n
}

async function main(): Promise<void> {
  await initDatabaseSchema()

  // ---- admin ----
  const adminArg = arg('admin')
  let adminUser = process.env.SEED_ADMIN_USERNAME?.trim() || 'admin'
  let adminPass = process.env.SEED_ADMIN_PASSWORD?.trim() || ''
  if (adminArg && adminArg !== 'true') {
    const [u, ...rest] = adminArg.split(':')
    adminUser = u?.trim() || adminUser
    adminPass = rest.join(':')
  }
  let generated = false
  if (!adminPass && !(await findUserByUsername(adminUser))) {
    adminPass = randomBytes(9).toString('base64url')
    generated = true
  }
  if (adminPass && adminPass.length < 8) throw new Error('Admin password must be at least 8 characters')
  const adminResult = adminPass ? await ensureUser(adminUser, adminPass, 'admin') : 'exists'
  console.log(`admin  "${adminUser}": ${adminResult}${generated && adminResult === 'created' ? `  → generated password: ${adminPass}  (store it now, it is not shown again)` : ''}`)

  // ---- judges ----
  const judgeCount = Number(arg('judges') ?? process.env.SEED_JUDGES ?? 0) || 0
  const judgePass = arg('judge-password') ?? process.env.SEED_JUDGE_PASSWORD?.trim() ?? ''
  if (judgeCount > 0) {
    if (judgePass.length < 8) throw new Error('SEED_JUDGE_PASSWORD (or --judge-password) must be at least 8 characters when SEED_JUDGES > 0')
    for (let i = 1; i <= judgeCount; i++) {
      const name = `judge${i}`
      console.log(`judge  "${name}": ${await ensureUser(name, judgePass, 'judge')}`)
    }
  }

  // ---- sample contestants ----
  const wantSample = arg('sample') === 'true' || /^(1|true|yes)$/i.test(process.env.SEED_SAMPLE_CONTESTANTS ?? '')
  if (wantSample) {
    const inserted = await seedSampleContestants()
    console.log(inserted ? `contestants: inserted ${inserted} sample rows` : 'contestants: table not empty, skipped')
  }
}

main()
  .then(() => closePool())
  .catch(async (err) => {
    console.error('Seed failed:', err instanceof Error ? err.message : err)
    await closePool()
    process.exit(1)
  })
