import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { getPool } from '../db/pool.js'
import type { UserRecord, UserRole } from '../types/index.js'

interface UserRow extends RowDataPacket {
  id: number
  username: string
  password_hash: string
  role: UserRole
  has_submitted: number
  is_active: number
  password_changed_at: Date | null
  created_at: Date
  updated_at: Date
}

function rowToUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role,
    hasSubmitted: row.has_submitted === 1,
    isActive: row.is_active === 1,
    passwordChangedAt: row.password_changed_at ? new Date(row.password_changed_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export async function countUsers(): Promise<number> {
  const [rows] = await getPool().query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM users')
  return Number(rows[0]?.count ?? 0)
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const [rows] = await getPool().query<UserRow[]>('SELECT * FROM users WHERE username = ? LIMIT 1', [
    username.trim().toLowerCase(),
  ])
  return rows[0] ? rowToUser(rows[0]) : null
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  const [rows] = await getPool().query<UserRow[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id])
  return rows[0] ? rowToUser(rows[0]) : null
}

export async function listUsers(role?: UserRole): Promise<UserRecord[]> {
  const [rows] = role
    ? await getPool().query<UserRow[]>('SELECT * FROM users WHERE role = ? ORDER BY username ASC', [role])
    : await getPool().query<UserRow[]>('SELECT * FROM users ORDER BY role ASC, username ASC')
  return rows.map(rowToUser)
}

export async function createUser(input: {
  username: string
  passwordHash: string
  role: UserRole
}): Promise<UserRecord> {
  const [result] = await getPool().execute<ResultSetHeader>(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [input.username.trim().toLowerCase(), input.passwordHash, input.role],
  )
  const created = await findUserById(result.insertId)
  if (!created) throw new Error('Failed to create user')
  return created
}

export async function setHasSubmitted(id: number, value: boolean): Promise<void> {
  await getPool().execute('UPDATE users SET has_submitted = ? WHERE id = ?', [value ? 1 : 0, id])
}

/** Also stamps password_changed_at so every session issued before now becomes invalid. */
export async function updatePasswordHash(id: number, passwordHash: string): Promise<void> {
  await getPool().execute('UPDATE users SET password_hash = ?, password_changed_at = UTC_TIMESTAMP() WHERE id = ?', [
    passwordHash,
    id,
  ])
}

export async function setActive(id: number, value: boolean): Promise<void> {
  await getPool().execute('UPDATE users SET is_active = ? WHERE id = ?', [value ? 1 : 0, id])
}

/**
 * Returns false when the row does not exist. Throws ER_ROW_IS_REFERENCED_2 when the
 * user still owns score rows (judge FKs are ON DELETE RESTRICT) — callers check first.
 */
export async function deleteUser(id: number): Promise<boolean> {
  const [result] = await getPool().execute<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id])
  return result.affectedRows > 0
}
