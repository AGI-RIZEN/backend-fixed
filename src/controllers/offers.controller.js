import { offersService } from '../services/offers.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const offersController = {
  list: asyncHandler(async (_req, res) => {
    const offers = await offersService.list()
    res.json({ data: offers })
  })
}
