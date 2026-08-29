// Wraps an async route/controller function so any thrown error (or
// rejected promise) is forwarded to Express's error-handling middleware,
// instead of crashing the process or needing a try/catch in every handler.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
