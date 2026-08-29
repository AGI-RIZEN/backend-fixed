import { prisma } from '../config/database.js'

export const offersRepository = {
  findAll() {
    return prisma.offer.findMany({ orderBy: { createdAt: 'asc' } })
  }
}
