import client from '../client'
import { getLocalizedPath } from '@utils/apiPaths'
import type { Multiply } from '@app-types/api'

export const getMultiply = async (locale: string): Promise<Multiply> => {
  const path = getLocalizedPath(locale, '/multiply')
  const response = await client.get<Multiply>(path)
  return response.data
}
