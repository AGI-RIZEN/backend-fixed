import { ApiError } from '../utils/ApiError.js'

// Catches any request that didn't match a route, and turns it into the
// same consistent error shape as everything else, instead of Express's
// default plain-text 404 page.
export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`))
}
