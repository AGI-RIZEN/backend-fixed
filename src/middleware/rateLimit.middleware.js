import { RateLimiterRedis } from 'rate-limiter-flexible'
import { redis } from '../config/redis.js'
import { ApiError } from '../utils/ApiError.js'

// Redis-backed rate limiting, keyed by IP by default (or by user id for
// authenticated write-heavy endpoints). This module doesn't limit the
// login/signup endpoints themselves (that's the auth teammate's routes),
// but it's ready to be applied to any business route that needs
// protection — e.g. Add Expense, to slow down scripted abuse.

function makeLimiter({ points, duration, keyPrefix }) {
  const limiter = new RateLimiterRedis({
    storeClient: redis,
    points, // max requests
    duration, // per this many seconds
    keyPrefix
  })

  return async (req, _res, next) => {
    const key = req.user?.id ?? req.ip
    try {
      await limiter.consume(key)
      next()
    } catch {
      next(ApiError.tooManyRequests('Too many requests, please slow down'))
    }
  }
}

// Generic limiter for standard API writes: 30 requests / minute per user or IP.
export const standardRateLimit = makeLimiter({
  points: 30,
  duration: 60,
  keyPrefix: 'rl:standard'
})

// Stricter limiter, intended for reuse on sensitive auth endpoints
// (login/signup) by the teammate building that module.
export const strictRateLimit = makeLimiter({
  points: 5,
  duration: 900, // 15 minutes
  keyPrefix: 'rl:strict'
})
