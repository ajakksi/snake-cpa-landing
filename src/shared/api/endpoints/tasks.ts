import client from '../client'
import { parseApiResponse } from '../parseResponse'
import { getLocalizedPath } from '@utils/apiPaths'
import { tasksSchema, type Tasks } from '@app-types/api'

export const getTasks = async (locale: string): Promise<Tasks> => {
  const path = getLocalizedPath(locale, '/tasks')
  const response = await client.get<unknown>(path)
  return parseApiResponse(tasksSchema, response.data)
}
