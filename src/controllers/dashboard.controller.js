import { dashboardService } from '../services/dashboard.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const dashboardController = {
  summary: asyncHandler(async (req, res) => {
    const summary = await dashboardService.getSummary(req.user.id)
    res.json({ data: summary })
  })
}
