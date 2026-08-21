import { describe, it, expect, beforeEach, vi } from 'vitest'
import { submitContactForm } from './contact'
import { ApiError } from '@api/endpoints/errors'
import type { ContactFormValues } from '@validation/contactFormSchema'
import type { ContactFormResponse } from '@app-types/api'

vi.mock('@api/client', () => ({
  default: {
    post: vi.fn(),
  },
}))

import client from '@api/client'

const mockClient = client as unknown as { post: ReturnType<typeof vi.fn> }

describe('submitContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('trims and sends the form data, returning the server response', async () => {
    const mockResponse: ContactFormResponse = {
      message: 'Success',
      data: { name: 'John Doe', method: 'telegram', contact: '@john_doe' },
    }
    vi.mocked(mockClient.post).mockResolvedValue({ data: mockResponse })

    const formData: ContactFormValues = {
      name: '  John Doe  ',
      method: 'telegram',
      contact: '  @john_doe  ',
    }

    const result = await submitContactForm(formData)

    expect(mockClient.post).toHaveBeenCalledWith('/form', {
      name: 'John Doe',
      method: 'telegram',
      contact: '@john_doe',
    })
    expect(result).toEqual(mockResponse)
  })

  it.each(['', '   '])('treats an empty or whitespace-only name (%j) as undefined', async (name) => {
    vi.mocked(mockClient.post).mockResolvedValue({
      data: { message: 'Success', data: { name: undefined, method: 'whatsapp', contact: '555-1234' } },
    })

    await submitContactForm({ name, method: 'whatsapp', contact: '555-1234' })

    expect(mockClient.post).toHaveBeenCalledWith('/form', {
      name: undefined,
      method: 'whatsapp',
      contact: '555-1234',
    })
  })

  it('throws before calling the API when contact method is missing', async () => {
    const formData: ContactFormValues = { name: 'John', method: '', contact: 'test' }

    await expect(submitContactForm(formData)).rejects.toThrow('Contact method is required')
    expect(mockClient.post).not.toHaveBeenCalled()
  })

  it.each([
    new ApiError('Internal server error', 500, false, false),
    new ApiError('Network error', 0, false, true),
  ])('propagates an ApiError from the client unchanged (%#)', async (error) => {
    vi.mocked(mockClient.post).mockRejectedValue(error)

    const formData: ContactFormValues = { name: 'John', method: 'email', contact: 'j@e.com' }

    await expect(submitContactForm(formData)).rejects.toBe(error)
  })
})