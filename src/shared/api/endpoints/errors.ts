import { AxiosError } from 'axios'

export class ApiError extends Error {
  statusCode: number
  isTimeout: boolean
  isNetworkError: boolean

  constructor(
    message: string,
    statusCode: number = 0,
    isTimeout: boolean = false,
    isNetworkError: boolean = false,
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.isTimeout = isTimeout
    this.isNetworkError = isNetworkError
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const isTimeout = error.code === 'ECONNABORTED'
    const isNetworkError = !error.response
    const statusCode = error.response?.status || 0
    const data = error.response?.data as { message?: string } | undefined
    const message = data?.message || error.message || 'Unknown error'

    return new ApiError(message, statusCode, isTimeout, isNetworkError)
  }
}

export const isRetryableApiError = (error: unknown): boolean =>
  error instanceof ApiError &&
  (error.isNetworkError || error.isTimeout || (error.statusCode >= 500 && error.statusCode <= 599))


export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.statusCode === 403) {
      return 'Forbidden. Invalid or missing API Key.'
    }

    if (error.statusCode === 405) {
      return 'Method not allowed.'
    }

    if (error.statusCode === 500) {
      return 'Validation error or server error.'
    }

    if (error.statusCode) {
      return `Error ${error.statusCode}.`
    }

    if (error.isTimeout) {
      return 'The request timed out.'
    }

    if (error.isNetworkError) {
      return 'Check your connection.'
    }

    return 'Something went wrong.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}
