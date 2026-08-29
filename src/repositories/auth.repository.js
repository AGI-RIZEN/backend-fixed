import { prisma } from '../config/database.js'

export const authRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } })
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id } })
  },

  createUser({ name, email, passwordHash, role }) {
    return prisma.user.create({ data: { name, email, passwordHash, role } })
  },

  storeRefreshToken({ userId, tokenHash, expiresAt }) {
    return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } })
  },

  findRefreshToken(tokenHash) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } })
  },

  revokeRefreshToken(tokenHash) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true }
    })
  },

  // Revokes every refresh token for a user — used on "log out everywhere"
  // or as a defensive measure if a token is ever suspected compromised.
  revokeAllForUser(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true }
    })
  },

  createPasswordResetToken({ userId, tokenHash, expiresAt }) {
    return prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } })
  },

  findPasswordResetToken(tokenHash) {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash } })
  },

  markPasswordResetTokenUsed(tokenHash) {
    return prisma.passwordResetToken.updateMany({
      where: { tokenHash },
      data: { used: true }
    })
  },

  updatePassword(userId, passwordHash) {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  }
}
