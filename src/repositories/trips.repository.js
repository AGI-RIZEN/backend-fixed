import { prisma } from '../config/database.js'

export const tripsRepository = {
  findAllByUser(userId) {
    return prisma.trip.findMany({
      where: { userId },
      orderBy: { startDate: 'asc' }
    })
  },

  findById(id, userId) {
    return prisma.trip.findFirst({ where: { id, userId } })
  },

  create(userId, data) {
    return prisma.trip.create({ data: { ...data, userId } })
  },

  update(id, userId, data) {
    return prisma.trip.updateMany({ where: { id, userId }, data })
  },

  delete(id, userId) {
    return prisma.trip.deleteMany({ where: { id, userId } })
  }
}
