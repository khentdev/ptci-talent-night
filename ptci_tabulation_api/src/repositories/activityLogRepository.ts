import type { RowDataPacket } from 'mysql2'
import { getPool } from '../db/pool.js'
import type { ActivityLogRecord } from '../types/index.js'

interface ActivityLogRow extends RowDataPacket {
  id: number
  user_id: number | null
  username: string
  action: string
  details: string
  ip: string
  created_at: Date
}

export type ActivityLogInput = {
  userId: number | null
  username: string
  action: string
  details?: string
  ip?: string
}

export async function insertActivityLog(input: ActivityLogInput): Promise<void> {
  await getPool().execute(
    'INSERT INTO activity_logs (user_id, username, action, details, ip) VALUES (?, ?, ?, ?, ?)',
    [input.userId, input.username, input.action, (input.details ?? '').slice(0, 512), (input.ip ?? '').slice(0, 64)],
  )
}

export async function listActivityLogs(limit = 200): Promise<ActivityLogRecord[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 1000)
  const [rows] = await getPool().query<ActivityLogRow[]>(
    `SELECT * FROM activity_logs ORDER BY id DESC LIMIT ${safeLimit}`,
  )
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    username: r.username,
    action: r.action,
    details: r.details,
    ip: r.ip,
    createdAt: new Date(r.created_at).toISOString(),
  }))
}
