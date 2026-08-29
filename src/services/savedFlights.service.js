import { savedFlightsRepository } from '../repositories/savedFlights.repository.js'
import { ApiError } from '../utils/ApiError.js'

export const savedFlightsService = {
  async list(userId) {
    return savedFlightsRepository.findAllByUser(userId)
  },

  async create(userId, data) {
    return savedFlightsRepository.create(userId, data)
  },

  async delete(id, userId) {
    const result = await savedFlightsRepository.delete(id, userId)
    if (result.count === 0) throw ApiError.notFound('Saved flight not found')
  }
}
