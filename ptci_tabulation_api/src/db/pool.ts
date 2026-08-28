import mysql from 'mysql2/promise'
import { env } from '../config/env.js'

let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env.mysql.host,
      port: env.mysql.port,
      user: env.mysql.user,
      password: env.mysql.password,
      database: env.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      timezone: 'Z',
      // DECIMAL columns come back as strings (matches the frontend DTOs, e.g. total_score: string)
      decimalNumbers: false,
      ...(env.mysql.ssl ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } } : {}),
    })
    // `timezone: 'Z'` only tells the driver how to read DATETIME text; CURRENT_TIMESTAMP
    // defaults (created_at/updated_at) still use the *server's* zone. Pin every session
    // to UTC so stored and parsed times agree wherever the DB is hosted.
    pool.on('connection', (conn) => {
      conn.query("SET time_zone = '+00:00'")
    })
  }
  return pool
}

export async function testMysqlConnection(): Promise<boolean> {
  await getPool().query('SELECT 1')
  return true
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

/** Format a Date as MySQL DATETIME text in UTC ("YYYY-MM-DD HH:MM:SS"). */
export function toMysqlDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 19).replace('T', ' ')
}
