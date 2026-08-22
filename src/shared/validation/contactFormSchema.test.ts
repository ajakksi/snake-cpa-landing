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

  it('accepts every contact method', () => {
    contactMethods.forEach(({ value }) => {
      const result = schema.safeParse({ name: 'Test', method: value, contact: 'test' })
      expect(result.success).toBe(true)
    })
  })

  it('treats name as optional', () => {
    const result = schema.safeParse({ name: undefined, method: 'email', contact: 'test@example.com' })
    expect(result.success).toBe(true)
  })

  it('trims whitespace from name and contact before they reach the server', () => {
    const result = schema.safeParse({
      name: '  John Doe  ',
      method: 'telegram',
      contact: '  @john_doe  ',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('John Doe')
      expect(result.data.contact).toBe('@john_doe')
    }
  })

  it('accepts a whitespace-only name (unlike contact, name has no min-length check)', () => {
    const result = schema.safeParse({ name: '   ', method: 'email', contact: 'test@example.com' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('')
    }
  })

  it('rejects an empty or unset contact method with the required-field message', () => {
    const result = schema.safeParse({ name: 'John', method: '', contact: 'test@example.com' })

    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('method'))
      expect(issue?.message).toBe('Contact method is required')
    }
  })

  it('rejects a contact method outside the allowed set', () => {
    const result = schema.safeParse({ name: 'John', method: 'invalid_method', contact: 'test' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty or missing contact field with the required-field message', () => {
    const result = schema.safeParse({ name: 'John', method: 'email', contact: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('contact'))
      expect(issue?.message).toBe('Contact information is required')
    }
  })

  it('rejects a whitespace-only contact (trims to empty, fails the min-length check)', () => {
    const result = schema.safeParse({ name: 'John', method: 'telegram', contact: '   ' })
    expect(result.success).toBe(false)
  })

  it('reports errors for method and contact independently when both are invalid', () => {
    const result = schema.safeParse({ name: 'John', method: '', contact: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'))
      expect(paths).toContain('method')
      expect(paths).toContain('contact')
    }
  })
})
