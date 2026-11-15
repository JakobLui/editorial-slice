import { createApp } from './app'
import { env } from './config/env'
import { dataSource } from './database/data-source'
import { seedIfEmpty } from './database/seed'
import { logger } from './logger'

await dataSource.initialize()
await seedIfEmpty(dataSource)

const server = createApp().listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`)
})

const shutdownSignals = ['SIGINT', 'SIGTERM'] as const

shutdownSignals.forEach((signal) => {
  process.on(signal, () => {
    server.close(async () => {
      await dataSource.destroy()
      process.exit(0)
    })
  })
})
