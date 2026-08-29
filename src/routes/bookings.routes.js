import { Router } from 'express'
import { bookingsController } from '../controllers/bookings.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { standardRateLimit } from '../middleware/rateLimit.middleware.js'
import { createBookingSchema, bookingIdParamSchema } from '../validators/bookings.schema.js'

const router = Router()

router.use(requireAuth)

router.get('/', bookingsController.list)
router.post('/', standardRateLimit, validate(createBookingSchema), bookingsController.create)
router.delete('/:id', validate(bookingIdParamSchema, 'params'), bookingsController.remove)

export default router
