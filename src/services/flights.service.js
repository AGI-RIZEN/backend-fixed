import { flightsRepository } from '../repositories/flights.repository.js'

function toMinutes(duration) {
  let mins = 0
  for (const part of duration.split(' ')) {
    if (part.includes('h')) mins += parseInt(part, 10) * 60
    else if (part.includes('m')) mins += parseInt(part, 10)
  }
  return mins
}

export const flightsService = {
  async search(query) {
    const results = await flightsRepository.search(query)

    if (query.sort === 'cheapest') {
      return [...results].sort((a, b) => Number(a.price) - Number(b.price))
    }
    if (query.sort === 'fastest') {
      return [...results].sort((a, b) => toMinutes(a.duration) - toMinutes(b.duration))
    }
    // "best" — repository already orders by price, which doubles as a
    // reasonable default ranking without a real pricing/quality signal.
    return results
  }
}
