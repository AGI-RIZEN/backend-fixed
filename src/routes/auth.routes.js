import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { strictRateLimit } from '../middleware/rateLimit.middleware.js'
import {
  signupSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/auth.schema.js'

const router = Router()

// Strict rate limiting on every auth entry point — these are exactly the
// endpoints brute-force/credential-stuffing attacks target.
router.post('/signup', strictRateLimit, validate(signupSchema), authController.signup)
router.post('/login', strictRateLimit, validate(loginSchema), authController.login)
router.post('/refresh', strictRateLimit, validate(refreshSchema), authController.refresh)
router.post('/logout', validate(refreshSchema), authController.logout)
router.post(
  '/forgot-password',
  strictRateLimit,
  validate(forgotPasswordSchema),
  authController.forgotPassword
)
router.post(
  '/reset-password',
  strictRateLimit,
  validate(resetPasswordSchema),
  authController.resetPassword
)

router.get('/me', requireAuth, authController.me)

export default router
