import { wishlistRepository } from '../repositories/wishlist.repository.js'
import { ApiError } from '../utils/ApiError.js'

export const wishlistService = {
  async list(userId) {
    return wishlistRepository.findAllByUser(userId)
  },

  async create(userId, data) {
    return wishlistRepository.create(userId, data)
  },

  async delete(id, userId) {
    const result = await wishlistRepository.delete(id, userId)
    if (result.count === 0) throw ApiError.notFound('Wishlist item not found')
  }
}
