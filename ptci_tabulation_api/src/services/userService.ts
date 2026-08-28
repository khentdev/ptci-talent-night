import { z } from 'zod'
import { notFound, unprocessable } from '../lib/httpError.js'
import { validate } from '../lib/validate.js'
import { judgeHasScored } from '../repositories/scoreRepository.js'
import {
  createUser,
  deleteUser,
  findUserById,
  listUsers,
  setActive,
  setHasSubmitted,
  updatePasswordHash,
} from '../repositories/userRepository.js'
import { CATEGORY_KEYS } from '../scoring/categories.js'
import type { UserRecord, UserRole } from '../types/index.js'
import { hashPassword, passwordSchema, usernameSchema } from './authService.js'

const isDuplicateKey = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === 'ER_DUP_ENTRY'

export const createAccountSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  role: z.enum(['admin', 'judge'], { message: 'Role must be admin or judge' }),
})

export const resetPasswordSchema = z.object({ password: passwordSchema })

export const setActiveSchema = z.object({ is_active: z.boolean({ message: 'is_active must be true or false' }) })

export const roleQuerySchema = z.object({ role: z.enum(['admin', 'judge']).optional() })

export type AccountDTO = {
  id: string
  username: string
  role: UserRole
  has_submitted: boolean
  is_active: boolean
  created_at: string
}

export const toAccountDTO = (u: UserRecord): AccountDTO => ({
  id: String(u.id),
  username: u.username,
  role: u.role,
  has_submitted: u.hasSubmitted,
  is_active: u.isActive,
  created_at: u.createdAt,
})

export async function listAccounts(role?: UserRole): Promise<AccountDTO[]> {
  return (await listUsers(role)).map(toAccountDTO)
}

export async function createAccount(body: unknown): Promise<AccountDTO> {
  const input = validate(createAccountSchema, body)
  try {
    const user = await createUser({
      username: input.username,
      passwordHash: await hashPassword(input.password),
      role: input.role,
    })
    return toAccountDTO(user)
  } catch (err) {
    if (isDuplicateKey(err)) throw unprocessable(`Username "${input.username}" is already taken.`)
    throw err
  }
}

export async function resetAccountPassword(id: number, body: unknown): Promise<AccountDTO> {
  const { password } = validate(resetPasswordSchema, body)
  const user = await findUserById(id)
  if (!user) throw notFound('Account not found.')
  await updatePasswordHash(id, await hashPassword(password))
  return toAccountDTO(user)
}

/** Let a judge score again (clears `has_submitted`). Existing rows stay; duplicates are still rejected. */
export async function resetAccountSubmission(id: number): Promise<AccountDTO> {
  const user = await findUserById(id)
  if (!user) throw notFound('Account not found.')
  await setHasSubmitted(id, false)
  return toAccountDTO({ ...user, hasSubmitted: false })
}

/** Deactivated accounts cannot log in and every existing session for them is rejected immediately. */
export async function setAccountActive(id: number, body: unknown, actor: UserRecord): Promise<AccountDTO> {
  const { is_active } = validate(setActiveSchema, body)
  if (id === actor.id && !is_active) throw unprocessable('You cannot deactivate your own account.')
  const user = await findUserById(id)
  if (!user) throw notFound('Account not found.')
  await setActive(id, is_active)
  return toAccountDTO({ ...user, isActive: is_active })
}

/**
 * Hard delete. Refused (422) when the account still owns score rows — deleting a judge
 * would silently change every average, so deactivate instead. The DB enforces the same
 * rule (judge FKs are ON DELETE RESTRICT); this check just gives a readable message.
 */
export async function removeAccount(id: number, actor: UserRecord): Promise<AccountDTO> {
  if (id === actor.id) throw unprocessable('You cannot delete your own account.')
  const user = await findUserById(id)
  if (!user) throw notFound('Account not found.')
  for (const category of CATEGORY_KEYS) {
    if (await judgeHasScored(category, id)) {
      throw unprocessable(
        `"${user.username}" has submitted scores and cannot be deleted. Deactivate the account instead (PUT /users/${id}/active).`,
      )
    }
  }
  await deleteUser(id)
  return toAccountDTO(user)
}
