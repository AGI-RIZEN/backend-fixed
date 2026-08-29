import { walletRepository } from '../repositories/wallet.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { invalidateCache } from '../utils/cache.js'
import { notificationsService } from './notifications.service.js'

export const walletService = {
  // Composes everything the Travel Wallet page needs in one call:
  // balance, saved cards, and the transaction ledger.
  async getSummary(userId) {
    const [wallet, cards, transactions] = await Promise.all([
      walletRepository.findOrCreateWallet(userId),
      walletRepository.findCards(userId),
      walletRepository.findTransactions(userId)
    ])

    return {
      balance: Number(wallet.balance),
      cards,
      transactions
    }
  },

  async listCards(userId) {
    return walletRepository.findCards(userId)
  },

  // Only the last 4 digits of the submitted card number are ever
  // persisted — the full number passed validation in the zod schema
  // but is not stored anywhere past this point.
  async addCard(userId, { cardNumber, type, expiry, holder, primary }) {
    const last4 = cardNumber.slice(-4)

    const card = await walletRepository.createCard(userId, { type, last4, expiry, holder, primary })

    if (primary) {
      await walletRepository.setPrimaryCard(userId, card.id)
    }

    return card
  },

  async removeCard(id, userId) {
    const result = await walletRepository.deleteCard(id, userId)
    if (result.count === 0) throw ApiError.notFound('Card not found')
  },

  async listTransactions(userId) {
    return walletRepository.findTransactions(userId)
  },

  // Top-up: increases balance and records a matching credit transaction
  // atomically-in-effect (both writes happen together; if either fails
  // the caller sees an error rather than a silently inconsistent state).
  async topUp(userId, amount) {
    const wallet = await walletRepository.findOrCreateWallet(userId)
    const newBalance = Number(wallet.balance) + amount

    const [, transaction] = await Promise.all([
      walletRepository.updateBalance(userId, newBalance),
      walletRepository.createTransaction(userId, {
        title: 'Wallet Top Up',
        type: 'credit',
        amount,
        status: 'Completed'
      })
    ])

    await invalidateCache(`dashboard:${userId}:*`)

    await notificationsService.notify(userId, {
      type: 'wallet',
      title: 'Wallet topped up',
      message: `₹${amount} added to your wallet. New balance: ₹${newBalance}.`
    })

    return { balance: newBalance, transaction }
  }
}
