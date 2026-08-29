// A single, consistent shape for every error thrown in the app.
// The error-handling middleware turns this into a predictable JSON response.
export class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR', details = undefined) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }

  static badRequest(message, details) {
    return new ApiError(400, message, 'BAD_REQUEST', details)
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN')
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message, 'NOT_FOUND')
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message, 'CONFLICT')
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message, 'RATE_LIMITED')
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR')
  }
}
