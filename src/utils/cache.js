import { redis } from '../config/redis.js'
import { logger } from '../config/logger.js'

// Thin wrapper around Redis for read-through caching of expensive,
// frequently-requested aggregates (e.g. dashboard totals, category
// breakdowns). Cache failures never break the request — they just
// fall back to computing fresh, since Redis is an optimization here,
// not a source of truth.

export async function getCached(key) {
  try {
    const raw = await redis.get(key)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    logger.warn({ err, key }, 'Cache read failed, falling back to source')
    return null
  }
}

export async function setCached(key, value, ttlSeconds = 60) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch (err) {
    logger.warn({ err, key }, 'Cache write failed, continuing without cache')
  }
}

export async function invalidateCache(keyOrPattern) {
  try {
    if (keyOrPattern.includes('*')) {
      const keys = await redis.keys(keyOrPattern)
      if (keys.length > 0) await redis.del(...keys)
    } else {
      await redis.del(keyOrPattern)
    }
  } catch (err) {
    logger.warn({ err, keyOrPattern }, 'Cache invalidation failed')
  }
}

// Convenience: fetch from cache, or compute + populate cache on miss.
export async function cached(key, ttlSeconds, computeFn) {
  const hit = await getCached(key)
  if (hit !== null) return hit

  const value = await computeFn()
  await setCached(key, value, ttlSeconds)
  return value
}
