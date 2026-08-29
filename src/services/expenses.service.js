import { expensesRepository } from '../repositories/expenses.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { cached, invalidateCache } from '../utils/cache.js'
import { notificationsService } from './notifications.service.js'

const CATEGORIES = ['flight', 'hotel', 'meals', 'transit', 'other']

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as start of week
  return new Date(d.setDate(diff)).toISOString().slice(0, 10)
}

export const expensesService = {
  async list(userId, query) {
    const skip = (query.page - 1) * query.pageSize
    const [items, total] = await Promise.all([
      expensesRepository.findAllByUser(userId, { ...query, skip, take: query.pageSize }),
      expensesRepository.count(userId, query)
    ])

    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize)
      }
    }
  },

  async getById(id, userId) {
    const expense = await expensesRepository.findById(id, userId)
    if (!expense) throw ApiError.notFound('Expense not found')
    return expense
  },

  async create(userId, data) {
    // Prisma's DateTime columns need a real Date object (or a full
    // ISO-8601 string with a time component) — a bare "YYYY-MM-DD"
    // string throws "premature end of input" from the query engine.
    const expense = await expensesRepository.create(userId, {
      ...data,
      date: new Date(data.date)
    })
    // Any cached dashboard/aggregate data for this user is now stale.
    await invalidateCache(`dashboard:${userId}:*`)

    await notificationsService.notify(userId, {
      type: 'expense',
      title: 'Expense logged',
      message: `${data.merchant} — ₹${data.amount} logged under ${data.category}.`
    })

    return expense
  },

  async delete(id, userId) {
    const result = await expensesRepository.delete(id, userId)
    if (result.count === 0) throw ApiError.notFound('Expense not found')
    await invalidateCache(`dashboard:${userId}:*`)
  },

  // Powers the "Spend over time" chart's Weekly/Monthly/Yearly toggle.
  // Cached for 5 minutes per user+range since it's a fairly heavy
  // aggregation and the underlying data doesn't change every second.
  async getSpendOverTime(userId, range) {
    return cached(`dashboard:${userId}:spendOverTime:${range}`, 300, async () => {
      const expenses = await expensesRepository.findAllByUser(userId)
      const buckets = new Map()

      for (const e of expenses) {
        const d = new Date(e.date)
        let label
        if (range === 'week') label = startOfWeek(d)
        else if (range === 'year') label = String(d.getFullYear())
        else label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

        buckets.set(label, (buckets.get(label) || 0) + Number(e.amount))
      }

      return [...buckets.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, amount]) => ({ label, amount }))
    })
  },

  // Powers the "Spend by category over time" stacked chart.
  async getCategorySpendOverTime(userId, range) {
    return cached(`dashboard:${userId}:categorySpendOverTime:${range}`, 300, async () => {
      const expenses = await expensesRepository.findAllByUser(userId)
      const buckets = new Map()

      for (const e of expenses) {
        const d = new Date(e.date)
        let label
        if (range === 'week') label = startOfWeek(d)
        else if (range === 'year') label = String(d.getFullYear())
        else label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

        if (!buckets.has(label)) {
          buckets.set(label, Object.fromEntries(CATEGORIES.map((c) => [c, 0])))
        }
        buckets.get(label)[e.category] += Number(e.amount)
      }

      return [...buckets.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, categories]) => ({ label, ...categories }))
    })
  },

  // Powers the category breakdown pie chart.
  async getCategoryBreakdown(userId, { from, to } = {}) {
    const rows = await expensesRepository.sumByCategory(userId, { from, to })
    return rows.map((r) => ({ category: r.category, amount: Number(r._sum.amount || 0) }))
  },

  async getTotalSpend(userId, { from, to } = {}) {
    const result = await expensesRepository.sumTotal(userId, { from, to })
    return Number(result._sum.amount || 0)
  },

  async getThisMonthSpend(userId) {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
    return this.getTotalSpend(userId, { from, to })
  }
}
