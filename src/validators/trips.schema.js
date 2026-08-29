import { z } from 'zod'

export const createTripSchema = z.object({
  title: z.string().trim().min(1).max(200),
  destination: z.string().trim().min(1).max(200),
  startDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid date'),
  endDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid date'),
  status: z.enum(['Upcoming', 'Completed']).optional().default('Upcoming')
})

export const tripIdParamSchema = z.object({
  id: z.string().uuid()
})
