import { prisma } from '../config/database.js'

export const walletRepository = {
  findWallet(userId) {
    return prisma.wallet.findUnique({ where: { userId } })
  },

  // Every user gets a wallet lazily on first access rather than requiring
  // a separate provisioning step during signup (which is the auth
  // teammate's flow, not this one).
  async findOrCreateWallet(userId) {
    const existing = await prisma.wallet.findUnique({ where: { userId } })
    if (existing) return existing
    return prisma.wallet.create({ data: { userId, balance: 0 } })
  },

  updateBalance(userId, newBalance) {
    return prisma.wallet.update({ where: { userId }, data: { balance: newBalance } })
  },

  findCards(userId) {
    return prisma.savedCard.findMany({ where: { userId }, orderBy: { primary: 'desc' } })
  },

  createCard(userId, data) {
    return prisma.savedCard.create({ data: { ...data, userId } })
  },

  // Only one card can be primary at a time — unset any existing primary
  // before setting the new one, inside a transaction so it's atomic.
  async setPrimaryCard(userId, cardId) {
    return prisma.$transaction([
      prisma.savedCard.updateMany({ where: { userId }, data: { primary: false } }),
      prisma.savedCard.update({ where: { id: cardId }, data: { primary: true } })
    ])
  },

  deleteCard(id, userId) {
    return prisma.savedCard.deleteMany({ where: { id, userId } })
  },

  findTransactions(userId) {
    return prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    })
  },

  createTransaction(userId, data) {
    return prisma.walletTransaction.create({ data: { ...data, userId } })
  }
}
