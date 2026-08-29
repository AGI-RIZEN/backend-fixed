import { walletService } from '../services/wallet.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const walletController = {
  getSummary: asyncHandler(async (req, res) => {
    const summary = await walletService.getSummary(req.user.id)
    res.json({ data: summary })
  }),

  listCards: asyncHandler(async (req, res) => {
    const cards = await walletService.listCards(req.user.id)
    res.json({ data: cards })
  }),

  addCard: asyncHandler(async (req, res) => {
    const card = await walletService.addCard(req.user.id, req.body)
    res.status(201).json({ data: card })
  }),

  removeCard: asyncHandler(async (req, res) => {
    await walletService.removeCard(req.params.id, req.user.id)
    res.status(204).send()
  }),

  listTransactions: asyncHandler(async (req, res) => {
    const transactions = await walletService.listTransactions(req.user.id)
    res.json({ data: transactions })
  }),

  topUp: asyncHandler(async (req, res) => {
    const result = await walletService.topUp(req.user.id, req.body.amount)
    res.status(201).json({ data: result })
  })
}
