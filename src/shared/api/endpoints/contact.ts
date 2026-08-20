import client from '../client'
import { parseApiResponse } from '../parseResponse'

import {
  contactFormRequestSchema,
  contactFormResponseSchema,
  type ContactFormRequest,
  type ContactFormResponse,
} from '@app-types/api'
import type { ContactFormValues } from '@validation/contactFormSchema'

const normalizeContactMethod = (
  value: ContactFormValues['method'],
): ContactFormRequest['method'] => {
  if (value === '') {
    throw new Error('Contact method is required')
  }

  return value
}

const normalizeContactFormData = (data: ContactFormValues): ContactFormRequest => ({
  // Trim and shape the values before sending them to the backend.
  name: data.name?.trim() || undefined,
  method: normalizeContactMethod(data.method),
  contact: data.contact.trim(),
})

export const submitContactForm = async (data: ContactFormValues): Promise<ContactFormResponse> => {
  const payload = contactFormRequestSchema.parse(normalizeContactFormData(data))
  const response = await client.post<unknown>('/form', payload)
  return parseApiResponse(contactFormResponseSchema, response.data)
}
