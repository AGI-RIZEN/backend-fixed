import bcrypt from 'bcryptjs'
import { authRepository } from '../repositories/auth.repository.js'
import { walletRepository } from '../repositories/wallet.repository.js'
import { signAccessToken, generateRefreshToken, generateResetToken, hashToken } from '../utils/tokens.js'
import { emailService } from './email.service.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

const SALT_ROUNDS = 12

function publicUser(user) {
  // Never send the password hash back to the client, ever.
  const { passwordHash: _passwordHash, ...safe } = user
  return safe
}

export const authService = {
  async signup({ name, email, password }) {
    const existing = await authRepository.findByEmail(email)
    if (existing) throw ApiError.conflict('An account with this email already exists')

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await authRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'employee'
    })

    // New users get a wallet immediately so /wallet doesn't 404 the
    // first time they visit — same lazy-create pattern as before, just
    // called eagerly here for a smoother first-login experience.
    await walletRepository.findOrCreateWallet(user.id)

    // Deliberately NOT issuing a session here — signup just creates the
    // account. The person signs in separately afterwards, same as any
    // normal "register, then log in" flow. Email failures never block
    // signup; emailService swallows its own errors.
    await emailService.sendWelcomeEmail(user)

    return publicUser(user)
  },

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email)
    // Deliberately vague error message — never reveal whether it was
    // the email or the password that was wrong, which would let an
    // attacker enumerate valid emails.
    if (!user) throw ApiError.unauthorized('Invalid email or password')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw ApiError.unauthorized('Invalid email or password')

    return this.issueSession(user)
  },

  // Shared by signup and login: mints an access token + refresh token
  // pair, persists the refresh token's hash, returns both plus the
  // public-safe user object.
  async issueSession(user) {
    const accessToken = signAccessToken(user)
    const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken()

    await authRepository.storeRefreshToken({ userId: user.id, tokenHash, expiresAt })

    return { accessToken, refreshToken, user: publicUser(user) }
  },

  async refresh(refreshToken) {
    const tokenHash = hashToken(refreshToken)
    const stored = await authRepository.findRefreshToken(tokenHash)

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token is invalid or expired')
    }

    const user = await authRepository.findById(stored.userId)
    if (!user) throw ApiError.unauthorized('User no longer exists')

    // Rotate: revoke the used refresh token and issue a brand new one.
    // This means a stolen-and-reused old refresh token is immediately
    // useless the moment the legitimate client refreshes first.
    await authRepository.revokeRefreshToken(tokenHash)

    return this.issueSession(user)
  },

  async logout(refreshToken) {
    const tokenHash = hashToken(refreshToken)
    await authRepository.revokeRefreshToken(tokenHash)
  },

  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email)
    // Always behave identically whether or not the account exists —
    // otherwise this endpoint becomes a way to enumerate valid emails.
    // The controller returns the same generic response either way.
    if (!user) return

    const { token, tokenHash, expiresAt } = generateResetToken()
    await authRepository.createPasswordResetToken({ userId: user.id, tokenHash, expiresAt })

    const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`
    await emailService.sendPasswordResetEmail(user, resetUrl)
  },

  async resetPassword(token, newPassword) {
    const tokenHash = hashToken(token)
    const stored = await authRepository.findPasswordResetToken(tokenHash)

    if (!stored || stored.used || stored.expiresAt < new Date()) {
      throw ApiError.badRequest('This reset link is invalid or has expired')
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await authRepository.updatePassword(stored.userId, passwordHash)
    await authRepository.markPasswordResetTokenUsed(tokenHash)

    // A password reset should invalidate any session that might've been
    // established under the old password — force re-login everywhere.
    await authRepository.revokeAllForUser(stored.userId)
  },

  async me(userId) {
    const user = await authRepository.findById(userId)
    if (!user) throw ApiError.notFound('User not found')
    return publicUser(user)
  }
}
