import { queryClient } from '@/api/query-client'

/**
 * Development stand-in for login: the seeded users, with the fixed ids from
 * backend/src/database/seed.ts. The fetcher sends the chosen id as the
 * `X-User-Id` header. Removed together with this stand-in by the auth module.
 */
export const DEV_USERS = [
  {
    id: '01960000-0000-7000-8000-000000000001',
    name: 'Mette Hansen',
    role: 'editor',
  },
  {
    id: '01960000-0000-7000-8000-000000000002',
    name: 'Jonas Nielsen',
    role: 'contributor',
  },
  {
    id: '01960000-0000-7000-8000-000000000003',
    name: 'Sara Larsen',
    role: 'contributor',
  },
] as const

const STORAGE_KEY = 'editorial-slice.dev-user-id'

/** The chosen user's id. Defaults to the editor. */
export function getDevUserId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEV_USERS[0].id
  } catch {
    // Storage can be blocked, e.g. in a private window.
    return DEV_USERS[0].id
  }
}

/** Switch user and drop everything cached for the previous one. */
export function setDevUserId(userId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, userId)
  } catch {
    // Without storage the choice only lasts until the page reloads.
  }

  queryClient.resetQueries()
}
