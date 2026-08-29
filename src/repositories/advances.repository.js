import { prisma } from '../config/database.js'

export const advancesRepository = {
  findAllByUser(userId) {
    return prisma.advance.findMany({
      where: { userId },
      orderBy: { requestedOn: 'desc' }
    })
  },

  findById(id, userId) {
    return prisma.advance.findFirst({ where: { id, userId } })
  },

  create(userId, data) {
    return prisma.advance.create({
      data: { ...data, userId, adjusted: 0, status: 'Pending' }
    })
  },

  sumOutstanding(userId) {
    return prisma.advance.findMany({
      where: { userId, status: { not: 'Settled' } },
      select: { amount: true, adjusted: true }
    })
  }
}
