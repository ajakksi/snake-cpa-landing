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
  timeout: 45000,
})

client.interceptors.request.use((config) => {
  config.headers['x-api-key'] = apiKey
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      throw new ApiError(error instanceof Error ? error.message : 'Unknown error', 0, false, false)
    }

    throw ApiError.fromAxiosError(error)
  },
)

export default client
