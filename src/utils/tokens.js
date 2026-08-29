import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { env } from '../config/env.js'

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL_DAYS = 30

// Access token: short-lived, sent as Authorization: Bearer <token> on
// every request, verified by auth.middleware.js. Payload shape agreed
// across the whole app: { sub: userId, role }.
export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: ACCESS_TOKEN_TTL
  })
}

// Refresh token: long-lived, opaque random string (not a JWT) handed to
// the client and also stored — as a HASH, never in plain text — in the
// database, so it can be looked up and revoked on logout. Using a random
// token instead of a JWT here means revocation actually works instantly;
// a long-lived JWT can't be "un-issued" without a blocklist.
export function generateRefreshToken() {
  const token = crypto.randomBytes(48).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
  return { token, tokenHash, expiresAt }
}

const RESET_TOKEN_TTL_HOURS = 1

// Password reset token: same shape/idea as a refresh token (opaque
// random string, only the hash persisted), but much shorter-lived and
// single-use, since it authorizes a much more sensitive action.
export function generateResetToken() {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000)
  return { token, tokenHash, expiresAt }
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
