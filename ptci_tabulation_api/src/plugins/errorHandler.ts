import type { FastifyError, FastifyInstance } from 'fastify'
import { env } from '../config/env.js'
import { HttpError } from '../lib/httpError.js'

/**
 * Every error leaves the API as `{ status, message }` with a matching HTTP
 * status — the contract the Vue app's appErrorHandler/authErrorHandler expect
 * (it reads `err.response.status` and `err.response.data.status`).
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ status: 404, message: `Route not found: ${request.method} ${request.url}` })
  })

  app.setErrorHandler((error: FastifyError | HttpError | Error, request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.status).send({ status: error.status, message: error.message })
    }

    const fastifyError = error as FastifyError
    const statusCode = fastifyError.statusCode

    // Fastify-generated 4xx (bad JSON = 400, rate limit = 429, unsupported media = 415, CORS, ...)
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      const message =
        fastifyError.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE'
          ? 'Unsupported content type — send application/json.'
          : statusCode === 429
            ? 'Too many attempts. Please wait a few minutes and try again.'
            : fastifyError.validation
              ? 'Invalid request.'
              : fastifyError.message || 'Bad request.'
      return reply.status(statusCode).send({ status: statusCode, message })
    }

    request.log.error({ err: error }, 'Unhandled error')
    const message = env.isProd ? 'Something went wrong on our side. Please try again later.' : error.message
    return reply.status(500).send({ status: 500, message })
  })
}
