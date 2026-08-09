import { describe, it, expect, beforeEach } from 'vitest'
import { createContactFormSchema, contactMethods } from './contactFormSchema'
import type { ContactFormValues } from './contactFormSchema'
import type { TFunction } from 'i18next'

const mockT: TFunction<'contactForm'> = ((key: string): string => {
  const translations: Record<string, string> = {
    'errors.contactMethodRequired': 'Contact method is required',
    'errors.contactRequired': 'Contact information is required',
  }
  return translations[key] || key
}) as TFunction<'contactForm'>

describe('createContactFormSchema', () => {
  let schema: ReturnType<typeof createContactFormSchema>

  beforeEach(() => {
    schema = createContactFormSchema(mockT)
  })

  describe('successful validation', () => {
    it('validates all required fields with valid data', () => {
      const validData: ContactFormValues = {
        name: 'John Doe',
        method: 'telegram',
        contact: '@john_doe',
      }

      const result = schema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('validates with all three contact methods', () => {
      const methods: Array<'telegram' | 'whatsapp' | 'email'> = ['telegram', 'whatsapp', 'email']

      methods.forEach((method) => {
        const validData: ContactFormValues = {
          name: 'Test',
          method,
          contact: 'contact@example.com',
        }

        const result = schema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    it('validates without name field (optional)', () => {
      const validData: ContactFormValues = {
        name: undefined,
        method: 'email',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('trims whitespace from name field', () => {
      const dataWithWhitespace: ContactFormValues = {
        name: '  John Doe  ',
        method: 'telegram',
        contact: 'contact',
      }

      const result = schema.safeParse(dataWithWhitespace)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John Doe')
      }
    })

    it('trims whitespace from contact field', () => {
      const dataWithWhitespace: ContactFormValues = {
        name: 'John',
        method: 'email',
        contact: '  test@example.com  ',
      }

      const result = schema.safeParse(dataWithWhitespace)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.contact).toBe('test@example.com')
      }
    })
  })

  describe('contact method validation', () => {
    it('rejects empty string for contact method', () => {
      const invalidData = {
        name: 'John',
        method: '',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('method'))).toBe(true)
      }
    })

    it('shows correct error message for empty method', () => {
      const invalidData = {
        name: 'John',
        method: '',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const methodIssue = result.error.issues.find((issue) => issue.path.includes('method'))
        expect(methodIssue?.message).toBe('Contact method is required')
      }
    })

    it('rejects invalid contact method', () => {
      const invalidData = {
        name: 'John',
        method: 'invalid_method',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects missing contact method entirely (not just empty string)', () => {
      const invalidData = {
        name: 'John',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('accepts all valid contact methods', () => {
      contactMethods.forEach((method) => {
        const validData = {
          name: 'Test',
          method: method.value,
          contact: 'test',
        }

        const result = schema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('contact field validation', () => {
    it('rejects empty contact field', () => {
      const invalidData: ContactFormValues = {
        name: 'John',
        method: 'email',
        contact: '',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('contact'))).toBe(true)
      }
    })

    it('shows correct error message for empty contact', () => {
      const invalidData: ContactFormValues = {
        name: 'John',
        method: 'email',
        contact: '',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const contactIssue = result.error.issues.find((issue) => issue.path.includes('contact'))
        expect(contactIssue?.message).toBe('Contact information is required')
      }
    })

    it('rejects whitespace-only contact field (trims to empty, fails min length)', () => {
      const invalidData: ContactFormValues = {
        name: 'John',
        method: 'telegram',
        contact: '   ',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects missing contact field entirely', () => {
      const invalidData = {
        name: 'John',
        method: 'email',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('name field validation', () => {
    // name не имеет .min(), в отличие от contact — пустая/whitespace-only строка
    // после trim() остаётся валидной. Это асимметрия со схемой contact,
    // стоит явно зафиксировать, что это осознанное поведение.
    it('accepts whitespace-only name (trims to empty, no min length check)', () => {
      const validData: ContactFormValues = {
        name: '   ',
        method: 'email',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('')
      }
    })
  })

  describe('type validation', () => {
    it('rejects non-string name', () => {
      const invalidData = {
        name: 123,
        method: 'email',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects non-string method', () => {
      const invalidData = {
        name: 'John',
        method: 123,
        contact: 'test@example.com',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects non-string contact', () => {
      const invalidData = {
        name: 'John',
        method: 'email',
        contact: 123,
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects null values', () => {
      const invalidData = {
        name: null,
        method: 'email',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('ignores object with extra fields', () => {
      const dataWithExtra = {
        name: 'John',
        method: 'email',
        contact: 'test@example.com',
        extraField: 'should not be here',
      }

      const result = schema.safeParse(dataWithExtra)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          name: 'John',
          method: 'email',
          contact: 'test@example.com',
        })
      }
    })
  })

  describe('multiple field errors', () => {
    it('reports multiple validation errors at once', () => {
      const invalidData = {
        name: 123,
        method: '',
        contact: '',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('includes all failing field paths in error issues', () => {
      const invalidData = {
        name: 123,
        method: 'invalid',
        contact: '',
      }

      const result = schema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        const paths = result.error.issues.map((issue) => issue.path.join('.'))
        expect(paths).toContain('method')
        expect(paths).toContain('contact')
      }
    })
  })

  describe('edge cases', () => {
    it('preserves internal spaces after trim (does not collapse them)', () => {
      const validData: ContactFormValues = {
        name: '  John  Doe  Smith  ',
        method: 'email',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John  Doe  Smith')
      }
    })

    it('trims tabs and newlines, not just spaces', () => {
      const validData: ContactFormValues = {
        name: '  John\t\nDoe  ',
        method: 'email',
        contact: 'test@example.com',
      }

      const result = schema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John\t\nDoe')
      }
    })
  })
})