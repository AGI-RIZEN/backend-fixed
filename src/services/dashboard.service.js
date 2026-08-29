import { expensesService } from './expenses.service.js'
import { advancesService } from './advances.service.js'
import { bookingsRepository } from '../repositories/bookings.repository.js'
import { cached } from '../utils/cache.js'

// Composes the 4 KPI cards on the frontend's Expense page in one call,
// so the client makes one request instead of four. Cached briefly since
// it's read on every page load.
export const dashboardService = {
  async getSummary(userId) {
    return cached(`dashboard:${userId}:summary`, 60, async () => {
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()

      const [totalSpendYtd, thisMonthSpend, outstandingAdvances, bookings] =
        await Promise.all([
          expensesService.getTotalSpend(userId, { from: startOfYear }),
          expensesService.getThisMonthSpend(userId),
          advancesService.getOutstandingTotal(userId),
          bookingsRepository.findAllByUser(userId)
        ])

      const upcomingFlights = bookings.filter(
        (b) => b.type === 'flight' && b.status === 'Confirmed' && new Date(b.date) >= now
      ).length

      return { totalSpendYtd, thisMonthSpend, outstandingAdvances, upcomingFlights }
    })
  }
}
