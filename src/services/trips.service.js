import { tripsRepository } from '../repositories/trips.repository.js'
import { bookingsRepository } from '../repositories/bookings.repository.js'
import { expensesRepository } from '../repositories/expenses.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { invalidateCache } from '../utils/cache.js'

export const tripsService = {
  async list(userId) {
    return tripsRepository.findAllByUser(userId)
  },

  async create(userId, data) {
    // Same fix as expenses: Prisma needs real Date objects, not bare
    // "YYYY-MM-DD" strings, for DateTime columns.
    const trip = await tripsRepository.create(userId, {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    })
    await invalidateCache(`dashboard:${userId}:*`)
    return trip
  },

  // Mirrors the frontend's Trip Report page: for a given trip, return its
  // itinerary (bookings) alongside every expense logged against it, plus
  // a computed total — expenses are the source of truth for spend, not
  // booking prices, to avoid double-counting a flight that's both booked
  // and separately logged as an expense.
  async getTripDetail(tripId, userId) {
    const trip = await tripsRepository.findById(tripId, userId)
    if (!trip) throw ApiError.notFound('Trip not found')

    const [bookings, expenses] = await Promise.all([
      bookingsRepository.findAllByUser(userId, { tripId }),
      expensesRepository.findAllByUser(userId, { tripId })
    ])

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    const breakdown = Object.values(
      expenses.reduce((acc, e) => {
        acc[e.category] = acc[e.category] || { category: e.category, amount: 0 }
        acc[e.category].amount += Number(e.amount)
        return acc
      }, {})
    )

    return { ...trip, bookings, expenses, total, breakdown }
  },

  async delete(tripId, userId) {
    const result = await tripsRepository.delete(tripId, userId)
    if (result.count === 0) throw ApiError.notFound('Trip not found')
    await invalidateCache(`dashboard:${userId}:*`)
  }
}
