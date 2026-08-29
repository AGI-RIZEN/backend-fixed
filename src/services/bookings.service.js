import { bookingsRepository } from '../repositories/bookings.repository.js'
import { authRepository } from '../repositories/auth.repository.js'
import { emailService } from './email.service.js'
import { ApiError } from '../utils/ApiError.js'

export const bookingsService = {
  async list(userId, tripId) {
    return bookingsRepository.findAllByUser(userId, { tripId })
  },

  async create(userId, data) {
    // Same DateTime fix as expenses/trips — which fields need converting
    // depends on booking type: flight/cab use `date`, hotel uses
    // `checkIn`/`checkOut` instead.
    const normalized = { ...data }
    if (normalized.date) normalized.date = new Date(normalized.date)
    if (normalized.checkIn) normalized.checkIn = new Date(normalized.checkIn)
    if (normalized.checkOut) normalized.checkOut = new Date(normalized.checkOut)

    const booking = await bookingsRepository.create(userId, normalized)

    const user = await authRepository.findById(userId)
    if (user) await emailService.sendBookingConfirmedEmail(user, booking)

    return booking
  },

  // Called by the controller if bookingsService.create() throws, so the
  // person gets an email even when the booking didn't go through — not
  // just a silent 400/500 in the UI. Never throws itself: a failure to
  // report a failure shouldn't produce a second, more confusing error.
  async notifyBookingFailed(userId, attemptedData, err) {
    try {
      const user = await authRepository.findById(userId)
      if (user) await emailService.sendBookingFailedEmail(user, attemptedData, err?.message)
    } catch {
      // best-effort notification — swallow
    }
  },

  async delete(id, userId) {
    const result = await bookingsRepository.delete(id, userId)
    if (result.count === 0) throw ApiError.notFound('Booking not found')
  }
}
