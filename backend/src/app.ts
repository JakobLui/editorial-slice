import express from 'express'
import { pinoHttp } from 'pino-http'
import { devUserFromHeader } from './auth/current-user'
import { logger } from './logger'
import { errorHandler, notFoundHandler } from './middleware/error-handler'
import { contentRouter } from './modules/content/content.router'
import { healthRouter } from './modules/health/health.router'
import { usersRouter } from './modules/users/users.router'
import { buildOpenApiDocument } from './openapi/document'

export function createApp() {
  const app = express()

  app.use(
    pinoHttp({
      logger,
      // Log only what identifies a request, not every header.
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  )
  app.use(express.json())

  // Mount each module's router here.
  app.use('/api/health', healthRouter)
  app.use('/api/content', devUserFromHeader, contentRouter)
  app.use('/api/users', devUserFromHeader, usersRouter)

  app.get('/api/openapi.json', (_req, res) => {
    res.json(buildOpenApiDocument())
  })

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
