import { app } from './app.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { disconnectRedis } from './config/redis.js'

let server

async function start() {
  // Fail fast if we can't reach the database at boot — better to crash
  // immediately with a clear log than serve traffic that will 500 on
  // every request.
  await connectDatabase()
  logger.info('Database connected')

  server = app.listen(env.port, () => {
    logger.info(`SkyDesk backend listening on port ${env.port} (${env.nodeEnv})`)
  })
}

// Graceful shutdown: stop accepting new connections, let in-flight
// requests finish, then close DB/Redis before actually exiting. This is
// what lets Docker/Kubernetes restart or scale the app without dropping
// a user's request mid-flight.
async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`)

  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }

  await disconnectDatabase()
  await disconnectRedis()

  logger.info('Shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection')
})

start().catch((err) => {
  logger.error({ err }, 'Failed to start server')
  process.exit(1)
})
