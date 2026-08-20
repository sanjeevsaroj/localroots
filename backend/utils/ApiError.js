// Standard application error with an HTTP status code attached.
// Thrown from controllers, caught by the centralized error handler.
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}
