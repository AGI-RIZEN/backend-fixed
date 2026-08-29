import { z } from 'zod'

export const createWishlistItemSchema = z.object({
  destination: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(10),
  price: z.number().positive(),
  image: z.string().trim().url().optional(),
  reason: z.string().trim().max(200).optional(),
  priceDropped: z.boolean().optional().default(false),
  dropAmount: z.number().nonnegative().optional()
})

export const wishlistIdParamSchema = z.object({
  id: z.string().uuid()
})
