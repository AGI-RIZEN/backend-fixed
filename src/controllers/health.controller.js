import { prisma } from '../config/database.js'
import { redis } from '../config/redis.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const healthController = {
  // Liveness: is the process itself alive? Always fast, no dependencies.
  live: (_req, res) => {
    res.json({ status: 'ok' })
  },

  // Readiness: can the app actually serve traffic right now? Checks that
  // both the database and Redis are reachable. Docker/orchestrators use
  // this to decide whether to route traffic to this instance.
  ready: asyncHandler(async (_req, res) => {
    const checks = {}

    try {
      await prisma.$queryRaw`SELECT 1`
      checks.database = 'ok'
    } catch {
      checks.database = 'unreachable'
    }

    try {
      await redis.ping()
      checks.redis = 'ok'
    } catch {
      checks.redis = 'unreachable'
    }

    const healthy = Object.values(checks).every((status) => status === 'ok')
    res.status(healthy ? 200 : 503).json({ status: healthy ? 'ready' : 'not_ready', checks })
  })
}
