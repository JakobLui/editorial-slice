import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError, z } from 'zod'
import { AppError } from '../errors'

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.path}` })
}

// Express 5 forwards errors thrown in async handlers here.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res
      .status(400)
      .json({ message: 'Validation failed', issues: z.flattenError(err) })
    return
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message })
    return
  }

  // pino-http logs the error with the request when the response finishes.
  res.err = err
  res.status(500).json({ message: 'Internal server error' })
}
