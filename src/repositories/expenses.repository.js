import { prisma } from '../config/database.js'

export const expensesRepository = {
  findAllByUser(userId, { category, tripId, from, to, skip, take } = {}) {
    return prisma.expense.findMany({
      where: {
        userId,
        ...(category ? { category } : {}),
        ...(tripId ? { tripId } : {}),
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {})
              }
            }
          : {})
      },
      orderBy: { date: 'desc' },
      skip,
      take
    })
  },

  count(userId, { category, tripId } = {}) {
    return prisma.expense.count({
      where: {
        userId,
        ...(category ? { category } : {}),
        ...(tripId ? { tripId } : {})
      }
    })
  },

  findById(id, userId) {
    return prisma.expense.findFirst({ where: { id, userId } })
  },

  create(userId, data) {
    return prisma.expense.create({ data: { ...data, userId, status: 'Logged' } })
  },

  delete(id, userId) {
    return prisma.expense.deleteMany({ where: { id, userId } })
  },

  // Used by the aggregation service for dashboard charts — grouped sums
  // are pushed down to the database rather than pulled into app memory.
  sumByCategory(userId, { from, to } = {}) {
    return prisma.expense.groupBy({
      by: ['category'],
      where: {
        userId,
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {})
              }
            }
          : {})
      },
      _sum: { amount: true }
    })
  },

  sumTotal(userId, { from, to } = {}) {
    return prisma.expense.aggregate({
      where: {
        userId,
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {})
              }
            }
          : {})
      },
      _sum: { amount: true }
    })
  }
}
