import { advancesService } from '../services/advances.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const advancesController = {
  list: asyncHandler(async (req, res) => {
    const advances = await advancesService.list(req.user.id)
    res.json({ data: advances })
  }),

  create: asyncHandler(async (req, res) => {
    const advance = await advancesService.create(req.user.id, req.body)
    res.status(201).json({ data: advance })
  }),

  outstanding: asyncHandler(async (req, res) => {
    const total = await advancesService.getOutstandingTotal(req.user.id)
    res.json({ data: { outstandingTotal: total } })
  })
}
