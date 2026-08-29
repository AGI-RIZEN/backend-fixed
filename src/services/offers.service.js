import { offersRepository } from '../repositories/offers.repository.js'
import { cached } from '../utils/cache.js'

export const offersService = {
  // Global, not per-user — same offers for everyone, so one cache
  // entry for the whole app. Content only changes via re-seeding, so a
  // generous TTL is fine.
  async list() {
    return cached('offers:all', 600, () => offersRepository.findAll())
  }
}
