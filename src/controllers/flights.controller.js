import { flightsService } from '../services/flights.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const flightsController = {
  search: asyncHandler(async (req, res) => {
    const results = await flightsService.search(req.query)
    res.json({ data: results })
  })
}
