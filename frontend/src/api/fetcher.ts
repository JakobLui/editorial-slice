import { getDevUserId } from '@/api/dev-users'

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
 * Every generated API call goes through here (see orval.config.ts). It sends
 * the current user and turns error statuses into thrown `ApiError`s, so React
 * Query treats them as failures. Returns the parsed body only.
 */
export async function customFetch<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  const headers = new Headers(options.headers)
  // Development stand-in for login; the auth module replaces it.
  headers.set('X-User-Id', getDevUserId())

  const response = await fetch(url, { ...options, headers })
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
