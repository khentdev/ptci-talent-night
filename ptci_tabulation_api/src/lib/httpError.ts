/**
 * Error carrying an HTTP status. The global error handler turns it into the
 * `{ status, message }` body the Vue frontend expects (see plugins/errorHandler.ts).
 */
export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export const badRequest = (message: string) => new HttpError(400, message)
export const unauthorized = (message = 'Unauthorized. Please log in.') => new HttpError(401, message)
export const forbidden = (message = 'You do not have permission to do that.') => new HttpError(403, message)
export const notFound = (message: string) => new HttpError(404, message)
export const unprocessable = (message: string) => new HttpError(422, message)
