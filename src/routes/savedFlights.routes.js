import { Router } from 'express'
import { savedFlightsController } from '../controllers/savedFlights.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { standardRateLimit } from '../middleware/rateLimit.middleware.js'
import { createSavedFlightSchema, savedFlightIdParamSchema } from '../validators/savedFlights.schema.js'

const router = Router()

router.use(requireAuth)

router.get('/', savedFlightsController.list)
router.post('/', standardRateLimit, validate(createSavedFlightSchema), savedFlightsController.create)
router.delete('/:id', validate(savedFlightIdParamSchema, 'params'), savedFlightsController.remove)

export default router
