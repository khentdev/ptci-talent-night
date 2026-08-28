import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { getPool } from '../db/pool.js'
import { CATEGORIES, PRELIMINARY_CATEGORIES, type CategoryKey } from '../scoring/categories.js'
import type { Gender, Team } from '../types/index.js'

/*
 * Table and column names below are interpolated into SQL. They ALWAYS come from
 * scoring/categories.ts (a static config), never from request input.
 */

const isDuplicateKey = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === 'ER_DUP_ENTRY'

export type ScoreInsert = {
  category: CategoryKey
  judgeId: number
  candId: number
  /** column → value (already validated against the category's criteria) */
  values: Record<string, number>
  total: number
}

/** Returns the new score_id, or `'duplicate'` when this judge already scored the candidate. */
export async function insertScore(input: ScoreInsert): Promise<number | 'duplicate'> {
  const cat = CATEGORIES[input.category]
  const columns = cat.criteria.map((c) => c.column)
  const sql = `INSERT INTO ${cat.table} (judge_id, cand_id, ${columns.join(', ')}, total_score)
    VALUES (?, ?, ${columns.map(() => '?').join(', ')}, ?)`
  const params = [input.judgeId, input.candId, ...columns.map((col) => input.values[col] ?? 0), input.total]
  try {
    const [result] = await getPool().execute<ResultSetHeader>(sql, params)
    return result.insertId
  } catch (err) {
    if (isDuplicateKey(err)) return 'duplicate'
    throw err
  }
}

export interface JudgeScoreRow extends RowDataPacket {
  score_id: number
  judge_id: number
  judge_name: string
  cand_id: number
  cand_number: string
  cand_name: string
  cand_team: Team
  cand_gender: Gender
  total_score: string
  created_at: Date
  // plus one string column per criterion
  [criterion: string]: unknown
}

/** Every individual score in a category (one row per judge × candidate). */
export async function listJudgeScores(category: CategoryKey, gender?: Gender): Promise<JudgeScoreRow[]> {
  const cat = CATEGORIES[category]
  const criteria = cat.criteria.map((c) => `s.${c.column}`).join(', ')
  const where = gender ? 'WHERE c.cand_gender = ?' : ''
  const [rows] = await getPool().query<JudgeScoreRow[]>(
    `SELECT s.score_id, s.judge_id, u.username AS judge_name,
            c.cand_id, c.cand_number, c.cand_name, c.cand_team, c.cand_gender,
            ${criteria}, s.total_score, s.created_at
     FROM ${cat.table} s
     JOIN contestants c ON c.cand_id = s.cand_id
     JOIN users u ON u.id = s.judge_id
     ${where}
     ORDER BY s.judge_id ASC, c.cand_gender ASC, CAST(c.cand_number AS UNSIGNED) ASC`,
    gender ? [gender] : [],
  )
  return rows
}

export interface CandidateAggregateRow extends RowDataPacket {
  score_id: number
  cand_id: number
  cand_number: string
  cand_name: string
  cand_team: Team
  cand_gender: Gender
  total_score: string
  judges_count: number
  created_at: Date
  updated_at: Date
  [criterion: string]: unknown
}

/** Per-candidate averages across all judges for one category (the "scoreboard" view). */
export async function aggregateByCandidate(category: CategoryKey, gender?: Gender): Promise<CandidateAggregateRow[]> {
  const cat = CATEGORIES[category]
  const criteria = cat.criteria.map((c) => `ROUND(AVG(s.${c.column}), 2) AS ${c.column}`).join(', ')
  const where = gender ? 'WHERE c.cand_gender = ?' : ''
  const [rows] = await getPool().query<CandidateAggregateRow[]>(
    `SELECT MIN(s.score_id) AS score_id,
            c.cand_id, c.cand_number, c.cand_name, c.cand_team, c.cand_gender,
            ${criteria},
            ROUND(AVG(s.total_score), 2) AS total_score,
            COUNT(*) AS judges_count,
            MIN(s.created_at) AS created_at,
            MAX(s.created_at) AS updated_at
     FROM ${cat.table} s
     JOIN contestants c ON c.cand_id = s.cand_id
     ${where}
     GROUP BY c.cand_id, c.cand_number, c.cand_name, c.cand_team, c.cand_gender
     ORDER BY total_score DESC, c.cand_gender ASC, CAST(c.cand_number AS UNSIGNED) ASC`,
    gender ? [gender] : [],
  )
  return rows
}

export interface OverallRow extends RowDataPacket {
  cand_id: number
  cand_number: string
  cand_name: string
  cand_team: Team
  cand_gender: Gender
  total_score: string
  categories_scored: number
  // one column per preliminary category key holding that category's average (or null)
  [category: string]: unknown
}

/**
 * Preliminary standing per candidate: the sum of each preliminary category's
 * judge-averaged total (max 100 each). Used to pick the Top 5 finalists.
 */
export async function overallByCandidate(gender?: Gender, limit?: number): Promise<OverallRow[]> {
  const aliases = PRELIMINARY_CATEGORIES.map((cat) => ({ cat, alias: `a_${cat.table}` }))
  const selectAvgs = aliases.map(({ cat, alias }) => `${alias}.avg_total AS \`${cat.key}\``).join(', ')
  const sumExpr = aliases.map(({ alias }) => `COALESCE(${alias}.avg_total, 0)`).join(' + ')
  const scoredExpr = aliases.map(({ alias }) => `(${alias}.avg_total IS NOT NULL)`).join(' + ')
  const joins = aliases
    .map(
      ({ cat, alias }) =>
        `LEFT JOIN (SELECT cand_id, ROUND(AVG(total_score), 2) AS avg_total FROM ${cat.table} GROUP BY cand_id) ${alias}
           ON ${alias}.cand_id = c.cand_id`,
    )
    .join('\n')
  const where = gender ? 'WHERE c.cand_gender = ?' : ''
  const limitClause = limit ? `LIMIT ${Math.max(1, Math.trunc(limit))}` : ''
  const [rows] = await getPool().query<OverallRow[]>(
    `SELECT c.cand_id, c.cand_number, c.cand_name, c.cand_team, c.cand_gender,
            ${selectAvgs},
            ROUND(${sumExpr}, 2) AS total_score,
            (${scoredExpr}) AS categories_scored
     FROM contestants c
     ${joins}
     ${where}
     ORDER BY total_score DESC, CAST(c.cand_number AS UNSIGNED) ASC
     ${limitClause}`,
    gender ? [gender] : [],
  )
  return rows
}

/** Has this judge submitted anything in the category yet? */
export async function judgeHasScored(category: CategoryKey, judgeId: number): Promise<boolean> {
  const cat = CATEGORIES[category]
  const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT 1 FROM ${cat.table} WHERE judge_id = ? LIMIT 1`,
    [judgeId],
  )
  return rows.length > 0
}
