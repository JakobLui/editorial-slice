import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/api/fetcher'

/** True for the queries of the content endpoints: board, lists and items. */
const isContentQuery = (queryKey: readonly unknown[]) =>
  typeof queryKey[0] === 'string' && queryKey[0].startsWith('/api/content')

/**
 * Retry network errors and server errors (5xx) up to 3 times. A 4xx answer
 * (not allowed, not found, archived) won't change on a retry, so it fails at once.
 */
const shouldRetry = (failureCount: number, error: Error) => {
  const isClientError =
    error instanceof ApiError && error.status >= 400 && error.status < 500

  return !isClientError && failureCount < 3
}

export const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry },
  },
  mutationCache: new MutationCache({
    // After any change, refetch everything about content. The API is the
    // source of truth; no optimistic updates.
    onSuccess: () =>
      queryClient.invalidateQueries({
        predicate: (query) => isContentQuery(query.queryKey),
      }),
    // Every failed change shows the API's message, e.g. "Only editors can
    // publish or unpublish".
    onError: (error) => {
      toast.error(error.message)
    },
  }),
})
