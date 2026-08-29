import { ApiError } from '../utils/ApiError.js'
import { logger } from '../config/logger.js'
import { isProd } from '../config/env.js'

// Single place every error in the app funnels through, via asyncHandler
// forwarding to next(err). Guarantees a consistent JSON error shape and
// never leaks stack traces in production.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError
  const statusCode = isApiError ? err.statusCode : 500
  const code = isApiError ? err.code : 'INTERNAL_ERROR'
  const message = isApiError || !isProd ? err.message : 'Something went wrong'

  if (statusCode >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled error')
  } else {
    logger.warn({ code, path: req.path, method: req.method }, message)
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(isApiError && err.details ? { details: err.details } : {}),
      ...(!isProd && !isApiError ? { stack: err.stack } : {})
    }
  })
}
