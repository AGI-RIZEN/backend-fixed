import { notificationsRepository } from '../repositories/notifications.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { invalidateCache } from '../utils/cache.js'

export const notificationsService = {
  async list(userId) {
    const [items, unreadCount] = await Promise.all([
      notificationsRepository.findAllByUser(userId),
      notificationsRepository.countUnread(userId)
    ])
    return { items, unreadCount }
  },

  async unreadCount(userId) {
    const count = await notificationsRepository.countUnread(userId)
    return { unreadCount: count }
  },

  // Called internally by other services (expenses, wallet, advances) when
  // something notification-worthy happens — never called directly from a
  // public "create notification" endpoint, since a user shouldn't be able
  // to fabricate arbitrary notifications for themselves via the API.
  async notify(userId, { type, title, message }) {
    const notification = await notificationsRepository.create(userId, { type, title, message })
    await invalidateCache(`notifications:${userId}:*`)
    return notification
  },

  async markRead(id, userId) {
    const result = await notificationsRepository.markRead(id, userId)
    if (result.count === 0) throw ApiError.notFound('Notification not found')
  },

  async markAllRead(userId) {
    await notificationsRepository.markAllRead(userId)
  }
}
