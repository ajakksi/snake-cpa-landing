import axios, { type AxiosRequestConfig } from 'axios'
import { ApiError } from './errors/errors'

const apiUrl = import.meta.env.VITE_API_URL
const apiKey = import.meta.env.VITE_API_KEY

if (!apiUrl) {
  throw new Error('VITE_API_URL is not defined in environment variables')
}
if (!apiKey) {
  throw new Error('VITE_API_KEY is not defined in environment variables')
}

const client = axios.create({
  baseURL: apiUrl,
  timeout: 45000,
})

client.interceptors.request.use((config) => {
  config.headers['x-api-key'] = apiKey
  return config
})

interface RetryableConfig extends AxiosRequestConfig {
  retryCount?: number
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

client.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      throw new ApiError(error instanceof Error ? error.message : 'Unknown error', 0, false, false)
    }

    const apiError = ApiError.fromAxiosError(error)
    const config = error.config as RetryableConfig | undefined

    if (!apiError.isNetworkError || !config) {
      throw apiError
    }

    const retryCount = config.retryCount ?? 0
    if (retryCount >= MAX_RETRIES) {
      throw apiError
    }

    config.retryCount = retryCount + 1
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))

    return client(config)
  },
)

export default client
