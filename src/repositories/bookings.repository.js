import { prisma } from '../config/database.js'

export const bookingsRepository = {
  findAllByUser(userId, { tripId } = {}) {
    return prisma.booking.findMany({
      where: { userId, ...(tripId ? { tripId } : {}) },
      orderBy: { date: 'asc' }
    })
  },

  findById(id, userId) {
    return prisma.booking.findFirst({ where: { id, userId } })
  },

  create(userId, data) {
    return prisma.booking.create({ data: { ...data, userId } })
  },

  delete(id, userId) {
    return prisma.booking.deleteMany({ where: { id, userId } })
  }
}
