import { prisma } from '../config/database.js'

export const notificationsRepository = {
  findAllByUser(userId, { limit = 50 } = {}) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  },

  countUnread(userId) {
    return prisma.notification.count({ where: { userId, read: false } })
  },

  create(userId, { type, title, message }) {
    return prisma.notification.create({ data: { userId, type, title, message } })
  },

  markRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    })
  },

  markAllRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    })
  }
}
