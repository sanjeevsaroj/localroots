// Wraps an async route handler so any thrown/rejected error is forwarded to
// Express's error-handling middleware instead of crashing the process.
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
