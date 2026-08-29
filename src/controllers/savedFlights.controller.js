import { savedFlightsService } from '../services/savedFlights.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const savedFlightsController = {
  list: asyncHandler(async (req, res) => {
    const items = await savedFlightsService.list(req.user.id)
    res.json({ data: items })
  }),

  create: asyncHandler(async (req, res) => {
    const item = await savedFlightsService.create(req.user.id, req.body)
    res.status(201).json({ data: item })
  }),

  remove: asyncHandler(async (req, res) => {
    await savedFlightsService.delete(req.params.id, req.user.id)
    res.status(204).send()
  })
}
