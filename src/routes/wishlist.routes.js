import { Router } from 'express'
import { wishlistController } from '../controllers/wishlist.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { standardRateLimit } from '../middleware/rateLimit.middleware.js'
import { createWishlistItemSchema, wishlistIdParamSchema } from '../validators/wishlist.schema.js'

const router = Router()

router.use(requireAuth)

router.get('/', wishlistController.list)
router.post('/', standardRateLimit, validate(createWishlistItemSchema), wishlistController.create)
router.delete('/:id', validate(wishlistIdParamSchema, 'params'), wishlistController.remove)

export default router
