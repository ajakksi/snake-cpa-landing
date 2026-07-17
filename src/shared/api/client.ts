import axios from 'axios'
import { ApiError } from './errors'

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
  timeout: 45000, // 45 seconds for cold start
})

// Request interceptor — add x-api-key to every request
client.interceptors.request.use((config) => {
  config.headers['x-api-key'] = apiKey
  return config
})

// Response interceptor — normalize errors
client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      throw ApiError.fromAxiosError(error)
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, 0, false)
    }
    throw new ApiError('Unknown error', 0, false)
  },
)

export default client
