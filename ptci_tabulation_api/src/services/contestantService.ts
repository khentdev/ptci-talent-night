import { z } from 'zod'
import { notFound, unprocessable } from '../lib/httpError.js'
import { validate } from '../lib/validate.js'
import {
  createContestant,
  deleteContestant,
  findContestantById,
  listContestants,
  updateContestant,
} from '../repositories/contestantRepository.js'
import { GENDERS, TEAMS, type ContestantDTO, type ContestantRecord, type Gender } from '../types/index.js'

const isDuplicateKey = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === 'ER_DUP_ENTRY'

export const contestantSchema = z.object({
  cand_number: z
    .string()
    .trim()
    .min(1, 'Candidate number is required')
    .max(8, 'Candidate number is too long')
    .regex(/^[0-9A-Za-z-]+$/, 'Candidate number may only contain letters, numbers and dashes'),
  cand_name: z.string().trim().min(2, 'Candidate name is required').max(128),
  cand_team: z.enum(TEAMS, { message: `Team must be one of: ${TEAMS.join(', ')}` }),
  cand_gender: z.enum(GENDERS, { message: `Gender must be one of: ${GENDERS.join(', ')}` }),
})

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid id'),
})

export const genderQuerySchema = z.object({
  gender: z.enum(GENDERS).optional(),
})

export function toContestantDTO(c: ContestantRecord): ContestantDTO {
  return {
    cand_id: String(c.candId),
    cand_number: c.candNumber,
    cand_name: c.candName,
    cand_team: c.candTeam,
    cand_gender: c.candGender,
    created_at: c.createdAt,
  }
}

export async function getContestants(gender?: Gender): Promise<ContestantDTO[]> {
  return (await listContestants(gender)).map(toContestantDTO)
}

export async function addContestant(body: unknown): Promise<ContestantDTO> {
  const input = validate(contestantSchema, body)
  try {
    const created = await createContestant({
      candNumber: input.cand_number,
      candName: input.cand_name,
      candTeam: input.cand_team,
      candGender: input.cand_gender,
    })
    return toContestantDTO(created)
  } catch (err) {
    if (isDuplicateKey(err)) throw unprocessable(`Candidate number ${input.cand_number} already exists for ${input.cand_gender} candidates.`)
    throw err
  }
}

export async function editContestant(id: number, body: unknown): Promise<ContestantDTO> {
  const input = validate(contestantSchema, body)
  const existing = await findContestantById(id)
  if (!existing) throw notFound('Contestant not found.')
  try {
    await updateContestant(id, {
      candNumber: input.cand_number,
      candName: input.cand_name,
      candTeam: input.cand_team,
      candGender: input.cand_gender,
    })
  } catch (err) {
    if (isDuplicateKey(err)) throw unprocessable(`Candidate number ${input.cand_number} already exists for ${input.cand_gender} candidates.`)
    throw err
  }
  const updated = await findContestantById(id)
  return toContestantDTO(updated ?? existing)
}

export async function removeContestant(id: number): Promise<ContestantDTO> {
  const existing = await findContestantById(id)
  if (!existing) throw notFound('The contestant may already have been deleted or was not found.')
  await deleteContestant(id)
  return toContestantDTO(existing)
}
