/** Throw from a service or handler to answer with a specific HTTP status. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, message)
  }
}
