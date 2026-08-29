import { z } from 'zod'

// Frontend's Add Card modal collects a full card number, but the backend
// only ever persists the last 4 digits — the full number is validated
// here and then discarded, never written to the database.
export const addCardSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, ''))
    .refine((val) => /^\d{13,19}$/.test(val), 'Card number must be 13–19 digits'),
  type: z.enum(['Visa', 'Mastercard', 'Amex', 'RuPay']).optional().default('Visa'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be in MM/YY format'),
  holder: z.string().trim().min(1).max(120),
  primary: z.boolean().optional().default(false)
})

export const cardIdParamSchema = z.object({
  id: z.string().uuid()
})

export const topUpSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0')
})
