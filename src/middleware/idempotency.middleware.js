import { redis } from '../config/redis.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Protects write endpoints (like Add Expense) from creating duplicate
// records when a request is retried — e.g. a double-click, or a client
// retrying after a timeout even though the first request actually
// succeeded server-side.
//
// The frontend generates a unique key per submission attempt and sends
// it as an `Idempotency-Key` header. First time we see a key, we run the
// handler normally and cache its response. If the same key shows up
// again within the TTL window, we return the cached response instead of
// running the handler (and creating a second expense) again.
//
// Usage: router.post('/expenses', requireAuth, idempotent(), controller.create)

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24 // 24 hours

export function idempotent() {
  return asyncHandler(async (req, res, next) => {
    const key = req.headers['idempotency-key']

    // Idempotency is opt-in from the client; if no key is sent, proceed
    // normally rather than blocking the request.
    if (!key) return next()

    const cacheKey = `idempotency:${req.user?.id ?? 'anon'}:${key}`
    const existing = await redis.get(cacheKey)

    if (existing) {
      const { statusCode, body } = JSON.parse(existing)
      return res.status(statusCode).json({ ...body, idempotentReplay: true })
    }

    // Intercept res.json to snapshot the response before it's sent, so
    // we can store it against this idempotency key for future retries.
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      redis
        .set(
          cacheKey,
          JSON.stringify({ statusCode: res.statusCode, body }),
          'EX',
          IDEMPOTENCY_TTL_SECONDS
        )
        .catch(() => {
          // best-effort — if Redis write fails, the request still succeeds,
          // it just won't be protected against a retry this one time
        })
      return originalJson(body)
    }

    next()
  })
}
