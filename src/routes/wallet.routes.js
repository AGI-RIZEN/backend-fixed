import { Router } from 'express'
import { walletController } from '../controllers/wallet.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { standardRateLimit } from '../middleware/rateLimit.middleware.js'
import { idempotent } from '../middleware/idempotency.middleware.js'
import { addCardSchema, cardIdParamSchema, topUpSchema } from '../validators/wallet.schema.js'

const router = Router()

router.use(requireAuth)

router.get('/', walletController.getSummary)

router.get('/cards', walletController.listCards)
router.post('/cards', standardRateLimit, validate(addCardSchema), walletController.addCard)
router.delete('/cards/:id', validate(cardIdParamSchema, 'params'), walletController.removeCard)

router.get('/transactions', walletController.listTransactions)

router.post(
  '/top-up',
  standardRateLimit,
  idempotent(), // protects against a double top-up on retry/double-click
  validate(topUpSchema),
  walletController.topUp
)

export default router
