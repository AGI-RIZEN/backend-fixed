import { advancesRepository } from '../repositories/advances.repository.js'
import { invalidateCache } from '../utils/cache.js'
import { notificationsService } from './notifications.service.js'

export const advancesService = {
  async list(userId) {
    return advancesRepository.findAllByUser(userId)
  },

  async create(userId, data) {
    const advance = await advancesRepository.create(userId, data)
    await invalidateCache(`dashboard:${userId}:*`)

    await notificationsService.notify(userId, {
      type: 'advance',
      title: 'Advance requested',
      message: `Requested ₹${data.amount} for "${data.purpose}".`
    })

    return advance
  },

  // Matches the frontend's "Outstanding advances" KPI card exactly:
  // sum of (amount - adjusted) for every advance not yet Settled.
  async getOutstandingTotal(userId) {
    const advances = await advancesRepository.sumOutstanding(userId)
    return advances.reduce(
      (sum, a) => sum + Number(a.amount) - Number(a.adjusted || 0),
      0
    )
  }
}
