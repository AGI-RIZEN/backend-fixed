import { Router } from 'express'
import { advancesController } from '../controllers/advances.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { standardRateLimit } from '../middleware/rateLimit.middleware.js'
import { createAdvanceSchema } from '../validators/advances.schema.js'

const router = Router()

router.use(requireAuth)

router.get('/', advancesController.list)
router.get('/outstanding', advancesController.outstanding)
router.post('/', standardRateLimit, validate(createAdvanceSchema), advancesController.create)

export default router
