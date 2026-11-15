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

export class UnauthorizedError extends AppError {
  constructor(message = 'Not signed in') {
    super(401, message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Not allowed') {
    super(403, message)
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(400, message)
  }
}
