import type { z } from 'zod'
import { ApiError } from './errors'

export const parseApiResponse = <T>(schema: z.ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data)

  if (!result.success) {
    console.error('Invalid API response', result.error.issues)
    throw new ApiError('Invalid server response')
  }

  return result.data
}
