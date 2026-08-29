import { Router } from 'express'
import { expensesController } from '../controllers/expenses.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { standardRateLimit } from '../middleware/rateLimit.middleware.js'
import { idempotent } from '../middleware/idempotency.middleware.js'
import {
  createExpenseSchema,
  listExpensesQuerySchema,
  expenseIdParamSchema
} from '../validators/expenses.schema.js'

const router = Router()

router.use(requireAuth)

// Chart/aggregate endpoints — read before the /:id route so 'spend-over-time'
// etc. aren't swallowed by the dynamic param route.
router.get('/spend-over-time', expensesController.spendOverTime)
router.get('/category-spend-over-time', expensesController.categorySpendOverTime)
router.get('/category-breakdown', expensesController.categoryBreakdown)

router.get('/', validate(listExpensesQuerySchema, 'query'), expensesController.list)

router.post(
  '/',
  standardRateLimit,
  idempotent(), // protects against duplicate expense creation on retry/double-click
  validate(createExpenseSchema),
  expensesController.create
)

router.get('/:id', validate(expenseIdParamSchema, 'params'), expensesController.getById)
router.delete('/:id', validate(expenseIdParamSchema, 'params'), expensesController.remove)

export default router
