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
