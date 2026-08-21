import { describe, it, expect } from 'vitest'
import { queryClient } from './queryClient'
import { ApiError } from '@api/endpoints/errors'

const options = queryClient.getDefaultOptions().queries!
const retry = options.retry as (failureCount: number, error: unknown) => boolean
const retryDelay = options.retryDelay as (attemptIndex: number) => number
const { staleTime, retryOnMount, refetchOnWindowFocus } = options

describe('queryClient — retry', () => {
  it.each([0, 1, 2])('should retry a retryable error on attempt %i (below the 3-attempt cap)', (failureCount) => {
    const networkError = new ApiError('Network', 0, false, true)
    expect(retry(failureCount, networkError)).toBe(true)
  })

  it('should stop retrying once the failure count reaches the cap (3)', () => {
    const networkError = new ApiError('Network', 0, false, true)
    expect(retry(3, networkError)).toBe(false)
  })

  it('should never retry a non-retryable error, regardless of attempt count', () => {
    const badRequest = new ApiError('Bad request', 400)
    expect(retry(0, badRequest)).toBe(false)
    expect(retry(1, badRequest)).toBe(false)
  })
})

describe('queryClient — retryDelay', () => {
  it.each([
    [0, 1000],
    [1, 2000],
    [2, 4000],
    [3, 8000],
    [4, 8000],
  ])('should back off exponentially, capped at 8s (attempt %i -> %ims)', (attemptIndex, expected) => {
    expect(retryDelay(attemptIndex)).toBe(expected)
  })
})

describe('queryClient — other defaults', () => {
  it('should cache query results for 5 minutes before considering them stale', () => {
    expect(staleTime).toBe(5 * 60 * 1000)
  })

  it('should not retry automatically just because a component using the query remounts', () => {
    expect(retryOnMount).toBe(false)
  })

  it('should not refetch just because the browser window regains focus', () => {
    expect(refetchOnWindowFocus).toBe(false)
  })
})