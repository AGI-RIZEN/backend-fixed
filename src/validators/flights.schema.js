import { z } from 'zod'

export const searchFlightsQuerySchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  international: z.coerce.boolean().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  stops: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (val === undefined ? undefined : Array.isArray(val) ? val : [val])),
  airline: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (val === undefined ? undefined : Array.isArray(val) ? val : [val])),
  sort: z.enum(['best', 'cheapest', 'fastest']).optional().default('best')
})
