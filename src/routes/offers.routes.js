import { Router } from 'express'
import { offersController } from '../controllers/offers.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.use(requireAuth)

router.get('/', offersController.list)

export default router
