import client from '../client'
import { getLocalizedPath } from '@utils/apiPaths'
import type { Tasks } from '@app-types/api'

export const getTasks = async (locale: string): Promise<Tasks> => {
  const path = getLocalizedPath(locale, '/tasks')
  const response = await client.get<Tasks>(path)
  return response.data
}
