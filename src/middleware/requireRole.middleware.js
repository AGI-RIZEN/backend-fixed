import { ApiError } from '../utils/ApiError.js'

// Server-side enforcement of the Admin/Employee distinction.
// This is what makes the role toggle in the frontend meaningful —
// without this, "Admin view" is just a UI label anyone could fake.
//
// Usage: router.post('/expenses/:id/approve', requireAuth, requireRole('admin'), ...)
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required')
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(`Requires one of roles: ${allowedRoles.join(', ')}`)
    }
    next()
  }
}
