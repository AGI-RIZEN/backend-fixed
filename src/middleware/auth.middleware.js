import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// IMPORTANT SCOPE NOTE:
// Login/signup/token *issuing* is owned by a teammate's auth module and
// is NOT part of this file. This middleware only *verifies* an incoming
// access token (issued elsewhere, using the same JWT_SECRET) and attaches
// the decoded identity to req.user so downstream business routes
// (trips, expenses, advances, cards) can trust who's calling and what
// role they have.
//
// Expected token payload shape (agree this with the auth teammate):
//   { sub: '<userId>', role: 'admin' | 'employee', iat, exp }

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header')
  }

  const token = header.slice('Bearer '.length)

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired')
    }
    throw ApiError.unauthorized('Invalid access token')
  }
})

// Attaches req.user if a valid token is present, but never rejects the
// request if it's missing/invalid. Useful for routes that behave
// differently for logged-in vs anonymous callers without requiring auth.
export function attachUserIfPresent(req, _res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return next()

  try {
    const payload = jwt.verify(header.slice('Bearer '.length), env.jwtSecret)
    req.user = { id: payload.sub, role: payload.role }
  } catch {
    // ignore invalid token, proceed as anonymous
  }
  next()
}
