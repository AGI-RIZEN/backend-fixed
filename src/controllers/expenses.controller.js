import { expensesService } from '../services/expenses.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

const VALID_RANGES = ['week', 'month', 'year']

export const expensesController = {
  list: asyncHandler(async (req, res) => {
    const result = await expensesService.list(req.user.id, req.query)
    res.json({ data: result.items, pagination: result.pagination })
  }),

  getById: asyncHandler(async (req, res) => {
    const expense = await expensesService.getById(req.params.id, req.user.id)
    res.json({ data: expense })
  }),

  create: asyncHandler(async (req, res) => {
    const expense = await expensesService.create(req.user.id, req.body)
    res.status(201).json({ data: expense })
  }),

  remove: asyncHandler(async (req, res) => {
    await expensesService.delete(req.params.id, req.user.id)
    res.status(204).send()
  }),

  spendOverTime: asyncHandler(async (req, res) => {
    const range = req.query.range || 'month'
    if (!VALID_RANGES.includes(range)) {
      throw ApiError.badRequest(`range must be one of: ${VALID_RANGES.join(', ')}`)
    }
    const data = await expensesService.getSpendOverTime(req.user.id, range)
    res.json({ data, range })
  }),

  categorySpendOverTime: asyncHandler(async (req, res) => {
    const range = req.query.range || 'month'
    if (!VALID_RANGES.includes(range)) {
      throw ApiError.badRequest(`range must be one of: ${VALID_RANGES.join(', ')}`)
    }
    const data = await expensesService.getCategorySpendOverTime(req.user.id, range)
    res.json({ data, range })
  }),

  categoryBreakdown: asyncHandler(async (req, res) => {
    const { from, to } = req.query
    const data = await expensesService.getCategoryBreakdown(req.user.id, { from, to })
    res.json({ data })
  })
}
