import { wishlistService } from '../services/wishlist.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const wishlistController = {
  list: asyncHandler(async (req, res) => {
    const items = await wishlistService.list(req.user.id)
    res.json({ data: items })
  }),

  create: asyncHandler(async (req, res) => {
    const item = await wishlistService.create(req.user.id, req.body)
    res.status(201).json({ data: item })
  }),

  remove: asyncHandler(async (req, res) => {
    await wishlistService.delete(req.params.id, req.user.id)
    res.status(204).send()
  })
}
