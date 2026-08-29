import { prisma } from '../config/database.js'

export const wishlistRepository = {
  findAllByUser(userId) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  },

  create(userId, data) {
    return prisma.wishlistItem.create({ data: { ...data, userId } })
  },

  delete(id, userId) {
    return prisma.wishlistItem.deleteMany({ where: { id, userId } })
  }
}
