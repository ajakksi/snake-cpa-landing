import client from '../client'
import { parseApiResponse } from '../parseResponse'
import { getLocalizedPath } from '@utils/apiPaths'
import { multiplySchema, type Multiply } from '@app-types/api'

export const getMultiply = async (locale: string): Promise<Multiply> => {
  const path = getLocalizedPath(locale, '/multiply')
  const response = await client.get<unknown>(path)
  return parseApiResponse(multiplySchema, response.data)
}
