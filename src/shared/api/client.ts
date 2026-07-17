import axios from 'axios'

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

// Request interceptor — add x-api-key to every request
client.interceptors.request.use((config) => {
  config.headers['x-api-key'] = apiKey
  return config
})

export default client
