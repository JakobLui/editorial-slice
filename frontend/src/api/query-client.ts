import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getGetMeQueryKey } from '@/api/generated/auth/auth'
import { ApiError } from '@/api/fetcher'

/** True for the queries of the content endpoints: board, lists and items. */
const isContentQuery = (queryKey: readonly unknown[]) =>
  typeof queryKey[0] === 'string' && queryKey[0].startsWith('/api/content')

const isMeQuery = (queryKey: readonly unknown[]) =>
  queryKey[0] === getGetMeQueryKey()[0]

const isUnauthorized = (error: Error) =>
  error instanceof ApiError && error.status === 401

/**
 * Retry network errors and server errors (5xx) up to 3 times. A 4xx answer
 * (not allowed, not found, archived) won't change on a retry, so it fails at once.
 */
const shouldRetry = (failureCount: number, error: Error) => {
  const isClientError =
    error instanceof ApiError && error.status >= 400 && error.status < 500

  return !isClientError && failureCount < 3
}

/**
 * A 401 means the session ended (it expired, or the user signed out in
 * another tab). Refetching `me` gets a 401 too, and RequireAuth then sends
 * the user to the login page.
 */
const recheckSession = () =>
  queryClient.resetQueries({ queryKey: getGetMeQueryKey() })

export const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      // Data counts as fresh for 30 seconds: a component that mounts (a
      // modal, a picker) or a return to the browser tab reuses it instead of
      // refetching. Our own changes still refetch at once (see onSuccess).
      staleTime: 30_000,
    },
  },
  queryCache: new QueryCache({
    // `me` itself is left out: RequireAuth reacts to its 401.
    onError: (error, query) => {
      if (isUnauthorized(error) && !isMeQuery(query.queryKey)) recheckSession()
    },
  }),
  mutationCache: new MutationCache({
    // After any change, refetch everything about content. The API is the
    // source of truth; no optimistic updates.
    onSuccess: () =>
      queryClient.invalidateQueries({
        predicate: (query) => isContentQuery(query.queryKey),
      }),
    // Every failed change shows the API's message, e.g. "Only editors can
    // publish or unpublish". A mutation with `meta.showsOwnError` (the login
    // form) shows its error itself.
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (mutation.meta?.showsOwnError) return

      if (isUnauthorized(error)) {
        recheckSession()
        return
      }

      toast.error(error.message)
    },
  }),
})
