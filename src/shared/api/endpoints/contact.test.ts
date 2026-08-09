import { describe, it, expect, beforeEach, vi } from 'vitest'
import { submitContactForm } from './contact'
import { ApiError } from '@api/errors/errors'
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

  describe('successful submission', () => {
    it('sends normalized (trimmed) form data to the API', async () => {
      const mockResponse: ContactFormResponse = {
        message: 'Success',
        data: {
          name: 'John Doe',
          method: 'telegram',
          contact: '@john_doe',
        },
      }

      vi.mocked(mockClient.post).mockResolvedValue({
        data: mockResponse,
      })

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

    it('converts empty name to undefined', async () => {
      const mockResponse: ContactFormResponse = {
        message: 'Success',
        data: { name: undefined, method: 'whatsapp', contact: '555-1234' },
      }
      vi.mocked(mockClient.post).mockResolvedValue({ data: mockResponse })

      const formData: ContactFormValues = { name: '', method: 'whatsapp', contact: '555-1234' }
      await submitContactForm(formData)

      expect(mockClient.post).toHaveBeenCalledWith('/form', {
        name: undefined,
        method: 'whatsapp',
        contact: '555-1234',
      })
    })

    it('converts whitespace-only name to undefined', async () => {
      const mockResponse: ContactFormResponse = {
        message: 'Success',
        data: { name: undefined, method: 'email', contact: 'test@example.com' },
      }
      vi.mocked(mockClient.post).mockResolvedValue({ data: mockResponse })

      const formData: ContactFormValues = {
        name: '   ',
        method: 'email',
        contact: 'test@example.com',
      }
      await submitContactForm(formData)

      expect(mockClient.post).toHaveBeenCalledWith('/form', {
        name: undefined,
        method: 'email',
        contact: 'test@example.com',
      })
    })

    it('returns the exact response payload from the server', async () => {
      const mockResponse: ContactFormResponse = {
        message: 'Form submitted successfully',
        data: { name: 'Jane Doe', method: 'telegram', contact: '@jane_doe' },
      }
      vi.mocked(mockClient.post).mockResolvedValue({ data: mockResponse })

      const formData: ContactFormValues = {
        name: 'Jane Doe',
        method: 'telegram',
        contact: '@jane_doe',
      }
      const result = await submitContactForm(formData)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('data normalization', () => {
    it('trims whitespace (including tabs/newlines) from name and contact', async () => {
      const mockResponse: ContactFormResponse = {
        message: 'Success',
        data: { name: 'Alice', method: 'whatsapp', contact: '+1234567890' },
      }
      vi.mocked(mockClient.post).mockResolvedValue({ data: mockResponse })

      const formData: ContactFormValues = {
        name: '  \t Alice \n  ',
        method: 'whatsapp',
        contact: '   \t +1234567890  \n  ',
      }
      await submitContactForm(formData)

      expect(mockClient.post).toHaveBeenCalledWith('/form', {
        name: 'Alice',
        method: 'whatsapp',
        contact: '+1234567890',
      })
    })

    it('only trims the edges, preserving internal whitespace', async () => {
      const mockResponse: ContactFormResponse = {
        message: 'Success',
        data: { name: 'John Smith', method: 'whatsapp', contact: '+1-555-1234' },
      }
      vi.mocked(mockClient.post).mockResolvedValue({ data: mockResponse })

      const formData: ContactFormValues = {
        name: 'John    Smith',
        method: 'whatsapp',
        contact: '+1-555-1234',
      }
      await submitContactForm(formData)

      // Внутренние пробелы должны остаться как есть — trim() убирает только края
      expect(mockClient.post).toHaveBeenCalledWith('/form', {
        name: 'John    Smith',
        method: 'whatsapp',
        contact: '+1-555-1234',
      })
    })

    it('passes through each contact method unchanged', async () => {
      const methods: Array<'telegram' | 'whatsapp' | 'email'> = ['telegram', 'whatsapp', 'email']

      for (const method of methods) {
        vi.clearAllMocks()
        vi.mocked(mockClient.post).mockResolvedValue({
          data: { message: 'Success', data: { name: 'Test', method, contact: 'test' } },
        })

        await submitContactForm({ name: 'Test', method, contact: 'test' })

        expect(mockClient.post).toHaveBeenCalledWith('/form', expect.objectContaining({ method }))
      }
    })
  })

  describe('validation errors', () => {
    it('throws a plain Error with the correct message when contact method is empty', async () => {
      const formData: ContactFormValues = { name: 'John Doe', method: '', contact: 'test' }

      await expect(submitContactForm(formData)).rejects.toThrow('Contact method is required')
      await expect(submitContactForm(formData)).rejects.toBeInstanceOf(Error)
    })

    it('does not call the API when validation fails', async () => {
      const formData: ContactFormValues = { name: 'John', method: '', contact: 'test' }

      await expect(submitContactForm(formData)).rejects.toThrow()
      expect(mockClient.post).not.toHaveBeenCalled()
    })
  })

  describe('API errors', () => {
    it('propagates ApiError instances from the client unchanged', async () => {
      const cases = [
        new ApiError('Invalid contact format', 400, false, false),
        new ApiError('Internal server error', 500, false, false),
        new ApiError('Network error', 0, false, true),
        new ApiError('Request timeout', 0, true, false),
      ]

      for (const error of cases) {
        vi.clearAllMocks()
        vi.mocked(mockClient.post).mockRejectedValue(error)

        const formData: ContactFormValues = { name: 'John', method: 'email', contact: 'j@e.com' }

        // toBe (не toThrow/toEqual) доказывает, что это тот же объект,
        // а не обёрнутая/подменённая ошибка
        await expect(submitContactForm(formData)).rejects.toBe(error)
      }
    })

    it('preserves statusCode and error flags on the thrown ApiError', async () => {
      const error = new ApiError('Forbidden', 403, false, false)
      vi.mocked(mockClient.post).mockRejectedValue(error)

      const formData: ContactFormValues = { name: 'John', method: 'whatsapp', contact: '123456' }

      try {
        await submitContactForm(formData)
        expect.fail('Should have thrown an error')
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError)
        expect((err as ApiError).statusCode).toBe(403)
      }
    })
  })

  describe('edge cases', () => {
    it('handles form data with undefined name field', async () => {
      const mockResponse: ContactFormResponse = {
        message: 'Success',
        data: { name: undefined, method: 'telegram', contact: '@user' },
      }
      vi.mocked(mockClient.post).mockResolvedValue({ data: mockResponse })

      const formData: ContactFormValues = {
        name: undefined,
        method: 'telegram',
        contact: '@user',
      }
      await submitContactForm(formData)

      expect(mockClient.post).toHaveBeenCalledWith('/form', {
        name: undefined,
        method: 'telegram',
        contact: '@user',
      })
    })
  })
})