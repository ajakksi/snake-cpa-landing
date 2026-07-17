import client from '../client'

import type { ContactFormRequest, ContactFormResponse } from '@app-types/api'

export const submitContactForm = async (data: ContactFormRequest): Promise<ContactFormResponse> => {
  const response = await client.post<ContactFormResponse>('/form', data)
  return response.data
}
