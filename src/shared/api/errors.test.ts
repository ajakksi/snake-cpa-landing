import { describe, it, expect } from 'vitest'
import { AxiosError, type AxiosResponse } from 'axios'
import { ApiError, getApiErrorMessage, isRetryableApiError } from './errors'

const mockResponse = (status: number, data: unknown = {}): AxiosResponse =>
  ({
    status,
    statusText: '',
    headers: {},
    config: { url: 'test', method: 'get', headers: {} },
    data,
  }) as AxiosResponse

describe('ApiError.fromAxiosError', () => {
  it('should use response.data.message when available', () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = mockResponse(404, { message: 'Resource not found' })

    const error = ApiError.fromAxiosError(axiosError)

    expect(error.message).toBe('Resource not found')
    expect(error.statusCode).toBe(404)
  })

  it('should fall back to error.message when response has no message', () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = mockResponse(500)

    expect(ApiError.fromAxiosError(axiosError).message).toBe('Request failed')
  })

  it('should fall back to "Unknown error" when nothing is available', () => {
    const axiosError = new AxiosError()
    axiosError.message = ''
    axiosError.response = mockResponse(500)

    expect(ApiError.fromAxiosError(axiosError).message).toBe('Unknown error')
  })

  it('should detect a timeout by ECONNABORTED', () => {
    const axiosError = new AxiosError('Timeout')
    axiosError.code = 'ECONNABORTED'

    const error = ApiError.fromAxiosError(axiosError)
    expect(error.isTimeout).toBe(true)
  })

  it('should detect a network error when there is no response', () => {
    const axiosError = new AxiosError('Network error')
    axiosError.response = undefined

    const error = ApiError.fromAxiosError(axiosError)
    expect(error.isNetworkError).toBe(true)
    expect(error.statusCode).toBe(0)
  })
})

describe('isRetryableApiError', () => {
  it.each([
    ['a network error', new ApiError('Network', 0, false, true)],
    ['a timeout', new ApiError('Timeout', 0, true, false)],
    ['a 500 (lower bound of 5xx)', new ApiError('Server error', 500)],
    ['a 599 (upper bound of 5xx)', new ApiError('Server error', 599)],
  ])('should be retryable: %s', (_label, error) => {
    expect(isRetryableApiError(error)).toBe(true)
  })

  it.each([
    ['a 4xx client error', new ApiError('Bad request', 400)],
    ['a 403 (auth error, retrying won\u2019t help)', new ApiError('Forbidden', 403)],
    ['a 600 (out of the 5xx range)', new ApiError('Weird', 600)],
    ['an ApiError with no known signal', new ApiError('Unknown', 0, false, false)],
  ])('should not be retryable: %s', (_label, error) => {
    expect(isRetryableApiError(error)).toBe(false)
  })

  it('should not be retryable when the error is not an ApiError', () => {
    expect(isRetryableApiError(new Error('plain error'))).toBe(false)
    expect(isRetryableApiError('a string')).toBe(false)
    expect(isRetryableApiError(null)).toBe(false)
  })
})

describe('getApiErrorMessage', () => {
  it.each([
    [403, 'Forbidden. Invalid or missing API Key.'],
    [405, 'Method not allowed.'],
    [500, 'Validation error or server error.'],
    [404, 'Error 404.'],
  ])('should map ApiError with statusCode %i to "%s"', (statusCode, expected) => {
    const error = new ApiError('message', statusCode)
    expect(getApiErrorMessage(error)).toBe(expected)
  })

  it('should return a timeout message when there is no statusCode', () => {
    const error = new ApiError('Timeout', 0, true)
    expect(getApiErrorMessage(error)).toBe('The request timed out.')
  })

  it('should return a network message when there is no statusCode or timeout', () => {
    const error = new ApiError('Network', 0, false, true)
    expect(getApiErrorMessage(error)).toBe('Check your connection.')
  })

  it('should return a generic fallback for an ApiError with no known signal', () => {
    const error = new ApiError('Something odd', 0, false, false)
    expect(getApiErrorMessage(error)).toBe('Something went wrong.')
  })

  it('should prioritize statusCode over timeout/network flags', () => {
    const error = new ApiError('Weird combo', 403, true, true)
    expect(getApiErrorMessage(error)).toBe('Forbidden. Invalid or missing API Key.')
  })

  it('should return the message for a plain Error', () => {
    expect(getApiErrorMessage(new Error('Something broke'))).toBe('Something broke')
  })

  it.each([['just a string'], [null], [undefined], [{ message: 'not an Error instance' }]])(
    'should return a generic fallback for non-Error values',
    (value) => {
      expect(getApiErrorMessage(value)).toBe('Something went wrong.')
    },
  )
})
