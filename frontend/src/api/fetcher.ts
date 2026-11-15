/** A non-2xx answer from the API, with the API's own message. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Every generated API call goes through here (see orval.config.ts). It turns
 * error statuses into thrown `ApiError`s, so React Query treats them as
 * failures, and returns the parsed body only. The browser sends the session
 * cookie by itself: the API is on the same origin (through the Vite proxy).
 */
export async function customFetch<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  const response = await fetch(url, options)
  const body = response.status === 204 ? '' : await response.text()
  const data = body ? JSON.parse(body) : undefined

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message ?? `Request failed with status ${response.status}`,
    )
  }

  return data as T
}

/** Orval types every hook's `error` with this (see orval.config.ts). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ErrorType<_Error> = ApiError
