import { Router } from 'express'
import { flightsController } from '../controllers/flights.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { searchFlightsQuerySchema } from '../validators/flights.schema.js'

const router = Router()

router.use(requireAuth)

router.get('/search', validate(searchFlightsQuerySchema, 'query'), flightsController.search)

export default router
