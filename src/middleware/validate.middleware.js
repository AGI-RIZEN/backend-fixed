import { ApiError } from '../utils/ApiError.js'

// Generic request-validation middleware — pass it a zod schema per route,
// and it validates req.body/req.params/req.query before the controller
// ever runs. Keeps this file dumb and reusable; the actual rules live in
// src/validators/*.
//
// Usage: router.post('/expenses', validate(createExpenseSchema), controller.create)
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      throw ApiError.badRequest('Validation failed', details)
    }

    req[source] = result.data
    next()
  }
}
