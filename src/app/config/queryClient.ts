import { QueryClient } from '@tanstack/react-query'
import { isRetryableApiError } from '@api/errors'

const FIVE_MINUTES_MS = 5 * 60 * 1000
const MAX_QUERY_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 1000
const MAX_RETRY_DELAY_MS = 8000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES_MS,
      retry: (failureCount, error) =>
        failureCount < MAX_QUERY_RETRIES && isRetryableApiError(error),
      retryDelay: (attemptIndex) =>
        Math.min(INITIAL_RETRY_DELAY_MS * 2 ** attemptIndex, MAX_RETRY_DELAY_MS),
      retryOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
})
