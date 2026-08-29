import { z } from 'zod'

// Field names match the frontend's expense entries exactly
// (see AddExpense/ExpenseReport in the SkyDesk frontend).
export const createExpenseSchema = z.object({
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid date'),
  category: z.enum(['flight', 'hotel', 'meals', 'transit', 'other']),
  merchant: z.string().trim().min(1, 'Merchant is required').max(200),
  description: z.string().trim().max(500).optional().default(''),
  amount: z.number().positive('Amount must be greater than 0'),
  tripId: z.string().uuid().nullable().optional(),
  bookingId: z.string().uuid().nullable().optional()
})

export const listExpensesQuerySchema = z.object({
  category: z.enum(['flight', 'hotel', 'meals', 'transit', 'other']).optional(),
  tripId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20)
})

export const expenseIdParamSchema = z.object({
  id: z.string().uuid()
})
