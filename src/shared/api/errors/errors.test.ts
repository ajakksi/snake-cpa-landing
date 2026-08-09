import { describe, it, expect } from 'vitest'
import { AxiosError, type AxiosResponse } from 'axios'
import { ApiError, getApiErrorMessage } from './errors'

const mockResponse = (status: number, data: unknown = {}): AxiosResponse =>
  ({
    status,
    statusText: '',
    headers: {},
    config: { url: 'test', method: 'get', headers: {} },
    data,
  }) as AxiosResponse

describe('ApiError', () => {
  describe('Constructor', () => {
    it('should create ApiError with message, correct name, and Error inheritance', () => {
      const error = new ApiError('Test error')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('ApiError')
    })

    it('should have default values when only message is provided', () => {
      const error = new ApiError('Error')
      expect(error.statusCode).toBe(0)
      expect(error.isTimeout).toBe(false)
      expect(error.isNetworkError).toBe(false)
    })

    it('should accept all constructor parameters', () => {
      const error = new ApiError('Server error', 500, true, true)

      expect(error.message).toBe('Server error')
      expect(error.statusCode).toBe(500)
      expect(error.isTimeout).toBe(true)
      expect(error.isNetworkError).toBe(true)
    })
  })

  describe('Inheritance from Error', () => {
    it('should be throwable and catchable as a standard Error', () => {
      expect(() => {
        throw new ApiError('Throwable error')
      }).toThrow(ApiError)

      try {
        throw new ApiError('Test')
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
      }
    })

    it('should have an Error stack trace mentioning ApiError', () => {
      const error = new ApiError('Test')
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('ApiError')
    })
  })

  describe('Static method fromAxiosError', () => {
    it('should create ApiError from AxiosError with response', () => {
      const axiosError = new AxiosError('Request failed')
      axiosError.response = mockResponse(404, { message: 'Resource not found' })

      const error = ApiError.fromAxiosError(axiosError)

      expect(error).toBeInstanceOf(ApiError)
      expect(error.message).toBe('Resource not found')
      expect(error.statusCode).toBe(404)
      expect(error.isNetworkError).toBe(false)
      expect(error.isTimeout).toBe(false)
    })

    it('should extract statusCode from response', () => {
      const axiosError = new AxiosError('Error')
      axiosError.response = mockResponse(403)

      const error = ApiError.fromAxiosError(axiosError)
      expect(error.statusCode).toBe(403)
    })

    it('should detect timeout error by code ECONNABORTED', () => {
      const axiosError = new AxiosError('Timeout')
      axiosError.code = 'ECONNABORTED'
      axiosError.response = mockResponse(0)

      const error = ApiError.fromAxiosError(axiosError)
      expect(error.isTimeout).toBe(true)
    })

    it('should detect network error when no response', () => {
      const axiosError = new AxiosError('Network error')
      axiosError.response = undefined

      const error = ApiError.fromAxiosError(axiosError)
      expect(error.isNetworkError).toBe(true)
      expect(error.statusCode).toBe(0)
    })

    it('should use error.message when response.data.message missing', () => {
      const axiosError = new AxiosError('Request failed')
      axiosError.response = mockResponse(500)

      const error = ApiError.fromAxiosError(axiosError)
      expect(error.message).toBe('Request failed')
    })

    it('should use "Unknown error" when no message available', () => {
      const axiosError = new AxiosError()
      axiosError.message = ''
      axiosError.response = mockResponse(500)

      const error = ApiError.fromAxiosError(axiosError)
      expect(error.message).toBe('Unknown error')
    })

    it('should prioritize response.data.message over error.message', () => {
      const axiosError = new AxiosError('Axios error message')
      axiosError.response = mockResponse(400, { message: 'Invalid input' })

      const error = ApiError.fromAxiosError(axiosError)
      expect(error.message).toBe('Invalid input')
    })

    it('should handle multiple error codes (network, timeout, http)', () => {
      const networkError = new AxiosError('Network')
      networkError.response = undefined
      const error1 = ApiError.fromAxiosError(networkError)
      expect(error1.isNetworkError).toBe(true)
      expect(error1.isTimeout).toBe(false)

      const timeoutError = new AxiosError('Timeout')
      timeoutError.code = 'ECONNABORTED'
      timeoutError.response = mockResponse(0)
      const error2 = ApiError.fromAxiosError(timeoutError)
      expect(error2.isTimeout).toBe(true)
      expect(error2.isNetworkError).toBe(false)

      const httpError = new AxiosError('HTTP Error')
      httpError.response = mockResponse(500)
      const error3 = ApiError.fromAxiosError(httpError)
      expect(error3.isNetworkError).toBe(false)
      expect(error3.isTimeout).toBe(false)
      expect(error3.statusCode).toBe(500)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty message', () => {
      const error = new ApiError('')
      expect(error.message).toBe('')
      expect(error.statusCode).toBe(0)
    })

    it('should handle very large statusCode', () => {
      const error = new ApiError('Error', 999)
      expect(error.statusCode).toBe(999)
    })

    it('should handle negative statusCode', () => {
      const error = new ApiError('Error', -1)
      expect(error.statusCode).toBe(-1)
    })

    it('should handle timeout and network error simultaneously', () => {
      const error = new ApiError('Timeout', 0, true, true)
      expect(error.isTimeout).toBe(true)
      expect(error.isNetworkError).toBe(true)
    })
  })
})

describe('getApiErrorMessage', () => {
  describe('ApiError instances', () => {
    it('should return specific message for 403', () => {
      const error = new ApiError('Forbidden', 403)
      expect(getApiErrorMessage(error)).toBe('Forbidden. Invalid or missing API Key.')
    })

    it('should return specific message for 405', () => {
      const error = new ApiError('Not allowed', 405)
      expect(getApiErrorMessage(error)).toBe('Method not allowed.')
    })

    it('should return specific message for 500', () => {
      const error = new ApiError('Server error', 500)
      expect(getApiErrorMessage(error)).toBe('Validation error or server error.')
    })

    it('should return generic statusCode message for other non-zero codes', () => {
      const error = new ApiError('Not found', 404)
      expect(getApiErrorMessage(error)).toBe('Error 404.')
    })

    it('should return timeout message when isTimeout is true and no statusCode', () => {
      const error = new ApiError('Timeout', 0, true)
      expect(getApiErrorMessage(error)).toBe('The request timed out.')
    })

    it('should return network error message when isNetworkError is true and no statusCode/timeout', () => {
      const error = new ApiError('Network', 0, false, true)
      expect(getApiErrorMessage(error)).toBe('Check your connection.')
    })

    it('should return generic fallback when no statusCode, timeout, or network error', () => {
      const error = new ApiError('Something odd', 0, false, false)
      expect(getApiErrorMessage(error)).toBe('Something went wrong.')
    })

    it('should prioritize statusCode branches over timeout/network flags', () => {
      const error = new ApiError('Weird combo', 403, true, true)
      expect(getApiErrorMessage(error)).toBe('Forbidden. Invalid or missing API Key.')
    })

    it('should prioritize isTimeout over isNetworkError when statusCode is 0', () => {
      const error = new ApiError('Both flags', 0, true, true)
      expect(getApiErrorMessage(error)).toBe('The request timed out.')
    })
  })

  describe('Plain Error instances (not ApiError)', () => {
    it('should return the error message for a generic Error', () => {
      const error = new Error('Something broke')
      expect(getApiErrorMessage(error)).toBe('Something broke')
    })

    it('should return empty string message as-is for generic Error', () => {
      const error = new Error('')
      expect(getApiErrorMessage(error)).toBe('')
    })
  })

  describe('Non-Error values', () => {
    it('should return fallback for a plain string', () => {
      expect(getApiErrorMessage('just a string')).toBe('Something went wrong.')
    })

    it('should return fallback for null', () => {
      expect(getApiErrorMessage(null)).toBe('Something went wrong.')
    })

    it('should return fallback for undefined', () => {
      expect(getApiErrorMessage(undefined)).toBe('Something went wrong.')
    })

    it('should return fallback for a plain object', () => {
      expect(getApiErrorMessage({ message: 'looks like an error but is not' })).toBe(
        'Something went wrong.',
      )
    })
  })

  describe('Integration with fromAxiosError', () => {
    it('should produce correct message for a real 403 axios error flow', () => {
      const axiosError = new AxiosError('Request failed')
      axiosError.response = mockResponse(403, { message: 'no key' })

      const apiError = ApiError.fromAxiosError(axiosError)
      expect(getApiErrorMessage(apiError)).toBe('Forbidden. Invalid or missing API Key.')
    })

    it('should produce correct message for a real network-error axios flow', () => {
      const axiosError = new AxiosError('Network Error')
      axiosError.response = undefined

      const apiError = ApiError.fromAxiosError(axiosError)
      expect(getApiErrorMessage(apiError)).toBe('Check your connection.')
    })

    it('should produce correct message for a real timeout axios flow', () => {
      const axiosError = new AxiosError('Timeout')
      axiosError.code = 'ECONNABORTED'
      axiosError.response = undefined

      const apiError = ApiError.fromAxiosError(axiosError)
      expect(getApiErrorMessage(apiError)).toBe('The request timed out.')
    })
  })
})