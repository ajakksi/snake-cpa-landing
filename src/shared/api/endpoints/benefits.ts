import client from '../client'
import { getLocalizedPath } from '@utils/apiPaths'
import type { Benefits } from '@app-types/api'

export const getBenefits = async (locale: string): Promise<Benefits> => {
  const path = getLocalizedPath(locale, '/benefits')
  const response = await client.get<Benefits>(path)
  return response.data
}
