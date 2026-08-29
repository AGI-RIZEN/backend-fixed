import { prisma } from '../config/database.js'

export const savedFlightsRepository = {
  findAllByUser(userId) {
    return prisma.savedFlight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  },

  create(userId, data) {
    return prisma.savedFlight.create({ data: { ...data, userId } })
  },

  delete(id, userId) {
    return prisma.savedFlight.deleteMany({ where: { id, userId } })
  }
}
