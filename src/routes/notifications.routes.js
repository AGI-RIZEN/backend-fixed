import { Router } from 'express'
import { notificationsController } from '../controllers/notifications.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { notificationIdParamSchema } from '../validators/notifications.schema.js'

const router = Router()

router.use(requireAuth)

router.get('/', notificationsController.list)
router.get('/unread-count', notificationsController.unreadCount)
router.patch('/:id/read', validate(notificationIdParamSchema, 'params'), notificationsController.markRead)
router.patch('/read-all', notificationsController.markAllRead)

export default router
