import { prisma } from '../config/database.js'

export const flightsRepository = {
  search({ from, to, international, maxPrice, stops, airline }) {
    return prisma.flightListing.findMany({
      where: {
        ...(from ? { from: { equals: from, mode: 'insensitive' } } : {}),
        ...(to ? { to: { equals: to, mode: 'insensitive' } } : {}),
        ...(international !== undefined ? { international } : {}),
        ...(maxPrice ? { price: { lte: maxPrice } } : {}),
        ...(stops?.length ? { stops: { in: stops } } : {}),
        ...(airline?.length ? { airline: { in: airline } } : {})
      },
      orderBy: { price: 'asc' }
    })
  },

  findById(id) {
    return prisma.flightListing.findUnique({ where: { id } })
  }
}
