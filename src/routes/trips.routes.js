import { Router } from 'express'
import { tripsController } from '../controllers/trips.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { standardRateLimit } from '../middleware/rateLimit.middleware.js'
import { createTripSchema, tripIdParamSchema } from '../validators/trips.schema.js'

const router = Router()

router.use(requireAuth)

router.get('/', tripsController.list)
router.post('/', standardRateLimit, validate(createTripSchema), tripsController.create)
router.get('/:id', validate(tripIdParamSchema, 'params'), tripsController.getDetail)
router.delete('/:id', validate(tripIdParamSchema, 'params'), tripsController.remove)

export default router
