import client from '../client'
import { parseApiResponse } from '../parseResponse'
import { getLocalizedPath } from '@utils/apiPaths'
import { benefitsSchema, type Benefits } from '@app-types/api'

export const getBenefits = async (locale: string): Promise<Benefits> => {
  const path = getLocalizedPath(locale, '/benefits')
  const response = await client.get<unknown>(path)
  return parseApiResponse(benefitsSchema, response.data)
}
