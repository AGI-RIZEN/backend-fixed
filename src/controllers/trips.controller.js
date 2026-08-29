import { tripsService } from '../services/trips.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const tripsController = {
  list: asyncHandler(async (req, res) => {
    const trips = await tripsService.list(req.user.id)
    res.json({ data: trips })
  }),

  create: asyncHandler(async (req, res) => {
    const trip = await tripsService.create(req.user.id, req.body)
    res.status(201).json({ data: trip })
  }),

  getDetail: asyncHandler(async (req, res) => {
    const detail = await tripsService.getTripDetail(req.params.id, req.user.id)
    res.json({ data: detail })
  }),

  remove: asyncHandler(async (req, res) => {
    await tripsService.delete(req.params.id, req.user.id)
    res.status(204).send()
  })
}
