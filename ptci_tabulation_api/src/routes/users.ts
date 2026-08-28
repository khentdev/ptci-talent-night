import type { FastifyPluginAsync } from 'fastify'
import { validate } from '../lib/validate.js'
import { requireRole } from '../plugins/auth.js'
import { logActivity } from '../services/activityService.js'
import { idParamSchema } from '../services/contestantService.js'
import {
  createAccount,
  listAccounts,
  removeAccount,
  resetAccountPassword,
  resetAccountSubmission,
  roleQuerySchema,
  setAccountActive,
} from '../services/userService.js'

/** Judge / admin account management — admin only. Backs the "Manage Judge/Admin Accounts" pages. */
export const userRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireRole('admin'))

  // GET /api/users[?role=judge|admin]
  app.get('/users', async (request) => {
    const { role } = validate(roleQuerySchema, request.query)
    const data = await listAccounts(role)
    return { status: 200, message: 'Accounts fetched successfully.', data }
  })

  // POST /api/users  { username, password, role }
  app.post('/users', async (request) => {
    const created = await createAccount(request.body)
    logActivity(request, 'user.create', `${created.role} "${created.username}"`)
    return { status: 'success', message: `${created.role === 'admin' ? 'Admin' : 'Judge'} account created successfully.`, data: created }
  })

  // PUT /api/users/:id/password  { password }
  app.put('/users/:id/password', async (request) => {
    const { id } = validate(idParamSchema, request.params)
    const user = await resetAccountPassword(id, request.body)
    logActivity(request, 'user.reset_password', `"${user.username}"`)
    return { status: 'success', message: 'Password updated successfully.', data: user }
  })

  // PUT /api/users/:id/reset-submission → has_submitted = false
  app.put('/users/:id/reset-submission', async (request) => {
    const { id } = validate(idParamSchema, request.params)
    const user = await resetAccountSubmission(id)
    logActivity(request, 'user.reset_submission', `"${user.username}"`)
    return { status: 'success', message: 'Submission flag cleared.', data: user }
  })

  // PUT /api/users/:id/active  { is_active: true|false } — deactivating kills the account's sessions at once
  app.put('/users/:id/active', async (request) => {
    const { id } = validate(idParamSchema, request.params)
    const user = await setAccountActive(id, request.body, request.user!)
    logActivity(request, user.is_active ? 'user.activate' : 'user.deactivate', `"${user.username}"`)
    return { status: 'success', message: user.is_active ? 'Account activated.' : 'Account deactivated.', data: user }
  })

  // DELETE /api/users/:id — refused (422) if the account has submitted scores; deactivate instead
  app.delete('/users/:id', async (request) => {
    const { id } = validate(idParamSchema, request.params)
    const user = await removeAccount(id, request.user!)
    logActivity(request, 'user.delete', `${user.role} "${user.username}"`)
    return { status: 'success', message: 'Account deleted successfully.' }
  })
}
