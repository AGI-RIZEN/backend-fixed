import { z } from 'zod'

export const createAdvanceSchema = z.object({
  purpose: z.string().trim().min(1).max(300),
  amount: z.number().positive('Amount must be greater than 0'),
  tripId: z.string().uuid().nullable().optional()
})

export const advanceIdParamSchema = z.object({
  id: z.string().uuid()
})
