import { pino } from 'pino'
import { env } from './config/env'

/** The app's one logger. Requests get a child of it as `req.log` (see app.ts). */
export const logger = pino({
  level: env.LOG_LEVEL,
  // Readable lines in development, JSON everywhere else.
  transport:
    env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
})
