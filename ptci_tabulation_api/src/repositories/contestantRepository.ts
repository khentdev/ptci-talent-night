import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { getPool } from '../db/pool.js'
import type { ContestantRecord, Gender, Team } from '../types/index.js'

interface ContestantRow extends RowDataPacket {
  cand_id: number
  cand_number: string
  cand_name: string
  cand_team: Team
  cand_gender: Gender
  created_at: Date
  updated_at: Date
}

function rowToContestant(row: ContestantRow): ContestantRecord {
  return {
    candId: row.cand_id,
    candNumber: row.cand_number,
    candName: row.cand_name,
    candTeam: row.cand_team,
    candGender: row.cand_gender,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

/** All contestants, males first, then by numeric candidate number. */
export async function listContestants(gender?: Gender): Promise<ContestantRecord[]> {
  const where = gender ? 'WHERE cand_gender = ?' : ''
  const [rows] = await getPool().query<ContestantRow[]>(
    `SELECT * FROM contestants ${where} ORDER BY cand_gender ASC, CAST(cand_number AS UNSIGNED) ASC, cand_number ASC`,
    gender ? [gender] : [],
  )
  return rows.map(rowToContestant)
}

export async function countContestants(): Promise<number> {
  const [rows] = await getPool().query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM contestants')
  return Number(rows[0]?.count ?? 0)
}

export async function findContestantById(candId: number): Promise<ContestantRecord | null> {
  const [rows] = await getPool().query<ContestantRow[]>('SELECT * FROM contestants WHERE cand_id = ? LIMIT 1', [
    candId,
  ])
  return rows[0] ? rowToContestant(rows[0]) : null
}

export type ContestantInput = {
  candNumber: string
  candName: string
  candTeam: Team
  candGender: Gender
}

export async function createContestant(input: ContestantInput): Promise<ContestantRecord> {
  const [result] = await getPool().execute<ResultSetHeader>(
    'INSERT INTO contestants (cand_number, cand_name, cand_team, cand_gender) VALUES (?, ?, ?, ?)',
    [input.candNumber.trim(), input.candName.trim(), input.candTeam, input.candGender],
  )
  const created = await findContestantById(result.insertId)
  if (!created) throw new Error('Failed to create contestant')
  return created
}

export async function updateContestant(candId: number, input: ContestantInput): Promise<boolean> {
  const [result] = await getPool().execute<ResultSetHeader>(
    'UPDATE contestants SET cand_number = ?, cand_name = ?, cand_team = ?, cand_gender = ? WHERE cand_id = ?',
    [input.candNumber.trim(), input.candName.trim(), input.candTeam, input.candGender, candId],
  )
  return result.affectedRows > 0
}

/** Scores referencing the contestant are removed by ON DELETE CASCADE. */
export async function deleteContestant(candId: number): Promise<boolean> {
  const [result] = await getPool().execute<ResultSetHeader>('DELETE FROM contestants WHERE cand_id = ?', [candId])
  return result.affectedRows > 0
}
