import { z } from 'zod'

export const createSavedFlightSchema = z.object({
  airline: z.string().trim().min(1).max(100),
  flightNo: z.string().trim().min(1).max(20),
  from: z.string().trim().min(1).max(10),
  to: z.string().trim().min(1).max(10),
  depart: z.string().trim().min(1),
  arrive: z.string().trim().min(1),
  duration: z.string().trim().min(1),
  stops: z.string().trim().min(1),
  price: z.number().positive(),
  cabin: z.string().trim().min(1).optional().default('Economy')
})

export const savedFlightIdParamSchema = z.object({
  id: z.string().uuid()
})
