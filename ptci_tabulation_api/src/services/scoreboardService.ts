import {
  aggregateByCandidate,
  listJudgeScores,
  overallByCandidate,
  type CandidateAggregateRow,
  type JudgeScoreRow,
  type OverallRow,
} from '../repositories/scoreRepository.js'
import { CATEGORIES, PRELIMINARY_CATEGORIES, type CategoryKey } from '../scoring/categories.js'
import type { Gender, Team } from '../types/index.js'

/*
 * All numbers leave here as strings with two decimals and all ids as strings —
 * that is what the Vue DTOs declare (e.g. total_score: string, cand_id: string),
 * and what the old PHP/mysqli backend produced.
 */
const dec = (v: unknown): string => Number(v ?? 0).toFixed(2)
const iso = (v: unknown): string => (v instanceof Date ? v : new Date(String(v))).toISOString()

type CandidateFields = {
  cand_id: string
  cand_number: string
  cand_name: string
  cand_team: Team
  cand_gender: Gender
}

const candidateFields = (r: { cand_id: number; cand_number: string; cand_name: string; cand_team: Team; cand_gender: Gender }): CandidateFields => ({
  cand_id: String(r.cand_id),
  cand_number: r.cand_number,
  cand_name: r.cand_name,
  cand_team: r.cand_team,
  cand_gender: r.cand_gender,
})

export type JudgeScoreDTO = CandidateFields & {
  score_id: string
  judge_id: string
  judge_name: string
  total_score: string
  created_at: string
  [criterion: string]: string
}

/** Scores grouped by judge: `{ "<judge_id>": [row, row, ...] }` — the shape JudgesScoresDataTable renders. */
export async function judgeScoresGrouped(category: CategoryKey, gender?: Gender): Promise<Record<string, JudgeScoreDTO[]>> {
  const cat = CATEGORIES[category]
  const rows = await listJudgeScores(category, gender)
  const grouped: Record<string, JudgeScoreDTO[]> = {}
  for (const r of rows) {
    const dto = toJudgeScoreDTO(r, cat.criteria.map((c) => c.column))
    ;(grouped[dto.judge_id] ??= []).push(dto)
  }
  return grouped
}

function toJudgeScoreDTO(r: JudgeScoreRow, columns: string[]): JudgeScoreDTO {
  const dto: JudgeScoreDTO = {
    ...candidateFields(r),
    score_id: String(r.score_id),
    judge_id: String(r.judge_id),
    judge_name: r.judge_name,
    total_score: dec(r.total_score),
    created_at: iso(r.created_at),
  }
  for (const col of columns) dto[col] = dec(r[col])
  return dto
}

export type CandidateFinalDTO = CandidateFields & {
  score_id: string
  total_score: string
  final_score: string
  judges_count: number
  created_at: string
  updated_at: string
  [criterion: string]: string | number
}

/**
 * Per-candidate averages across judges for one category, best first. Includes
 * `<category>_final_score` (e.g. talent_final_score) for the frontend's
 * OverallTalentScore DTO as well as the generic `final_score`/`total_score`.
 */
export async function candidateFinals(category: CategoryKey, gender?: Gender): Promise<CandidateFinalDTO[]> {
  const cat = CATEGORIES[category]
  const rows = await aggregateByCandidate(category, gender)
  return rows.map((r) => toFinalDTO(r, cat.criteria.map((c) => c.column), `${category.replace(/-/g, '_')}_final_score`))
}

function toFinalDTO(r: CandidateAggregateRow, columns: string[], aliasKey: string): CandidateFinalDTO {
  const total = dec(r.total_score)
  const dto: CandidateFinalDTO = {
    ...candidateFields(r),
    score_id: String(r.score_id),
    total_score: total,
    final_score: total,
    judges_count: Number(r.judges_count ?? 0),
    created_at: iso(r.created_at),
    updated_at: iso(r.updated_at),
  }
  dto[aliasKey] = total
  for (const col of columns) dto[col] = dec(r[col])
  return dto
}

export type OverallDTO = CandidateFields & {
  total_score: string
  categories_scored: number
  categories: Record<string, string>
}

function toOverallDTO(r: OverallRow): OverallDTO {
  const categories: Record<string, string> = {}
  for (const cat of PRELIMINARY_CATEGORIES) categories[cat.key] = dec(r[cat.key])
  return {
    ...candidateFields(r),
    total_score: dec(r.total_score),
    categories_scored: Number(r.categories_scored ?? 0),
    categories,
  }
}

/** Every candidate's preliminary standing (sum of judge-averaged category totals). */
export async function overallStandings(gender?: Gender): Promise<OverallDTO[]> {
  return (await overallByCandidate(gender)).map(toOverallDTO)
}

/** The five best male and five best female candidates by preliminary standing — the finals roster. */
export async function topFiveCandidates(limit = 5): Promise<OverallDTO[]> {
  const [males, females] = await Promise.all([
    overallByCandidate('male', limit),
    overallByCandidate('female', limit),
  ])
  return [...males, ...females].map(toOverallDTO)
}
