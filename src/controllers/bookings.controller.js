import { bookingsService } from '../services/bookings.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const bookingsController = {
  list: asyncHandler(async (req, res) => {
    const bookings = await bookingsService.list(req.user.id, req.query.tripId)
    res.json({ data: bookings })
  }),

  create: asyncHandler(async (req, res) => {
    try {
      const booking = await bookingsService.create(req.user.id, req.body)
      res.status(201).json({ data: booking })
    } catch (err) {
      await bookingsService.notifyBookingFailed(req.user.id, req.body, err)
      throw err
    }
  }),

  remove: asyncHandler(async (req, res) => {
    await bookingsService.delete(req.params.id, req.user.id)
    res.status(204).send()
  })
}
