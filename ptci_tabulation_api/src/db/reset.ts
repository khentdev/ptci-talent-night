/**
 * Wipe the database: drop EVERY table in MYSQL_DATABASE (users/admin, contestants,
 * scores, activity logs, and any leftover tables), then recreate the schema.
 *
 *   npm run db:reset -- --yes                 # drop + recreate empty tables
 *   npm run db:reset -- --yes --seed          # ...then run the seed (same flags as `npm run seed`)
 *   npm run db:reset -- --yes --seed --judges=5 --admin=admin:Secret123
 *
 * Refuses to run without --yes. Works against whatever MYSQL_* points at — including production.
 */
import type { RowDataPacket } from 'mysql2'
import { env } from '../config/env.js'
import { initDatabaseSchema } from './initSchema.js'
import { closePool, getPool } from './pool.js'
import { seedDatabase } from './seed.js'

const hasFlag = (name: string) => process.argv.includes(`--${name}`)

async function main(): Promise<void> {
  const target = `${env.mysql.user}@${env.mysql.host}:${env.mysql.port}/${env.mysql.database}`
  if (!hasFlag('yes')) {
    console.error(`Refusing to reset ${target} — this deletes ALL data, including admin accounts.`)
    console.error('Re-run with --yes to confirm:  npm run db:reset -- --yes [--seed]')
    process.exit(1)
  }

  console.log(`Resetting ${target} ...`)
  // FOREIGN_KEY_CHECKS is per-session, so the drops must share one connection.
  const conn = await getPool().getConnection()
  try {
    const [rows] = await conn.query<RowDataPacket[]>("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")
    const tables = rows.map((row) => String(Object.values(row)[0]))
    await conn.query('SET FOREIGN_KEY_CHECKS = 0')
    for (const table of tables) {
      await conn.query(`DROP TABLE IF EXISTS \`${table.replace(/`/g, '``')}\``)
      console.log(`  dropped ${table}`)
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1')
    console.log(tables.length ? `Dropped ${tables.length} tables.` : 'No tables to drop.')
  } finally {
    conn.release()
  }

  await initDatabaseSchema()
  console.log('Schema recreated.')

  if (hasFlag('seed')) await seedDatabase()
}

main()
  .then(() => closePool())
  .catch(async (err) => {
    console.error('Reset failed:', err instanceof Error ? err.message : err)
    await closePool()
    process.exit(1)
  })
