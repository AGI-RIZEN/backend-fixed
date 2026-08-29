import { notificationsService } from '../services/notifications.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const notificationsController = {
  list: asyncHandler(async (req, res) => {
    const result = await notificationsService.list(req.user.id)
    res.json({ data: result.items, unreadCount: result.unreadCount })
  }),

  unreadCount: asyncHandler(async (req, res) => {
    const result = await notificationsService.unreadCount(req.user.id)
    res.json({ data: result })
  }),

  markRead: asyncHandler(async (req, res) => {
    await notificationsService.markRead(req.params.id, req.user.id)
    res.status(204).send()
  }),

  markAllRead: asyncHandler(async (req, res) => {
    await notificationsService.markAllRead(req.user.id)
    res.status(204).send()
  })
}
