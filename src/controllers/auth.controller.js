import { authService } from '../services/auth.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authController = {
  signup: asyncHandler(async (req, res) => {
    const user = await authService.signup(req.body)
    res.status(201).json({ data: user })
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body)
    res.status(200).json({ data: result })
  }),

  refresh: asyncHandler(async (req, res) => {
    const result = await authService.refresh(req.body.refreshToken)
    res.status(200).json({ data: result })
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.body.refreshToken)
    res.status(204).send()
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email)
    // Same response regardless of whether the email matched an account.
    res.json({ data: { message: 'If an account exists for that email, a reset link has been sent.' } })
  }),

  resetPassword: asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password)
    res.json({ data: { message: 'Password updated. You can now sign in with your new password.' } })
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.me(req.user.id)
    res.json({ data: user })
  })
}
