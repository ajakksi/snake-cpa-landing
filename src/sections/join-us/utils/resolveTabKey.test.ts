import { describe, it, expect, afterEach, vi } from 'vitest'
import { resolveTabKey } from './resolveTabKey'
import i18n from '@i18n/i18n'

vi.mock('@i18n/i18n')

describe('resolveTabKey', () => {
  const originalI18nT = i18n.t

  afterEach(() => {

    Object.defineProperty(i18n, 't', {
      value: originalI18nT,
      writable: true,
      configurable: true,
    })
    vi.clearAllMocks()
  })

  const mockI18nT = (translationMap: Record<string, string>) => {
    Object.defineProperty(i18n, 't', {
      value: vi.fn((key: string) => translationMap[key] || key),
      writable: true,
      configurable: true,
    })
  }

  describe('Invalid inputs', () => {
    it('should return undefined if title is undefined', () => {
      const result = resolveTabKey(undefined)
      expect(result).toBeUndefined()
    })

    it('should return undefined if title is empty string', () => {
      const result = resolveTabKey('')
      expect(result).toBeUndefined()
    })
  })

  describe('Direct key matching', () => {
    it('should return "for_media_buyers" if title matches directly', () => {
      const result = resolveTabKey('for_media_buyers')
      expect(result).toBe('for_media_buyers')
    })

    it('should return "for_businesses" if title matches directly', () => {
      const result = resolveTabKey('for_businesses')
      expect(result).toBe('for_businesses')
    })

    it('should return "for_partners" if title matches directly', () => {
      const result = resolveTabKey('for_partners')
      expect(result).toBe('for_partners')
    })

    it('should return correct TabKey type', () => {
      const result = resolveTabKey('for_media_buyers')
      expect(['for_media_buyers', 'for_businesses', 'for_partners']).toContain(result)
    })
  })

  describe('Translation matching', () => {
    it('should find key by translated name', () => {
      mockI18nT({
        'joinUs:tabs.for_media_buyers': 'For media buyers',
        'joinUs:tabs.for_businesses': 'For businesses',
        'joinUs:tabs.for_partners': 'For partners',
      })

      const result = resolveTabKey('For media buyers')
      expect(result).toBe('for_media_buyers')
    })

    it('should find all translated variants', () => {
      mockI18nT({
        'joinUs:tabs.for_media_buyers': 'Media Buyers',
        'joinUs:tabs.for_businesses': 'Businesses',
        'joinUs:tabs.for_partners': 'Partners',
      })

      expect(resolveTabKey('Media Buyers')).toBe('for_media_buyers')
      expect(resolveTabKey('Businesses')).toBe('for_businesses')
      expect(resolveTabKey('Partners')).toBe('for_partners')
    })

    it('should call i18n.t with correct keys', () => {
      const mockFn = vi.fn().mockReturnValue('translated_value')
      Object.defineProperty(i18n, 't', {
        value: mockFn,
        writable: true,
        configurable: true,
      })

      resolveTabKey('some_title')

      // Verify i18n.t was called with correct keys
      expect(mockFn).toHaveBeenCalledWith('joinUs:tabs.for_media_buyers')
      expect(mockFn).toHaveBeenCalledWith('joinUs:tabs.for_businesses')
      expect(mockFn).toHaveBeenCalledWith('joinUs:tabs.for_partners')
    })
  })

  describe('No matching', () => {
    it('should return undefined if no match found', () => {
      mockI18nT({})

      const result = resolveTabKey('unknown_title')
      expect(result).toBeUndefined()
    })

    it('should return undefined if title does not match direct or translation', () => {
      mockI18nT({
        'joinUs:tabs.for_media_buyers': 'Buyers',
        'joinUs:tabs.for_businesses': 'Business',
        'joinUs:tabs.for_partners': 'Partners',
      })

      const result = resolveTabKey('Completely different text')
      expect(result).toBeUndefined()
    })

    it('should return undefined for partial match', () => {
      mockI18nT({
        'joinUs:tabs.for_media_buyers': 'For Media Buyers',
        'joinUs:tabs.for_businesses': 'For Businesses',
        'joinUs:tabs.for_partners': 'For Partners',
      })

      const result = resolveTabKey('Media')
      expect(result).toBeUndefined()
    })
  })

  describe('Edge cases', () => {
    it('should be case-sensitive for direct match', () => {
      mockI18nT({})

      const result = resolveTabKey('FOR_MEDIA_BUYERS')
      expect(result).toBeUndefined()
    })

    it('should handle whitespace correctly', () => {
      mockI18nT({
        'joinUs:tabs.for_media_buyers': 'Buyers',
        'joinUs:tabs.for_businesses': 'Business',
        'joinUs:tabs.for_partners': 'Partners',
      })

      const result = resolveTabKey(' Buyers ')
      expect(result).toBeUndefined()
    })

    it('should return first match if multiple match', () => {
      mockI18nT({
        'joinUs:tabs.for_media_buyers': 'same_translation',
        'joinUs:tabs.for_businesses': 'same_translation',
        'joinUs:tabs.for_partners': 'same_translation',
      })

      const result = resolveTabKey('same_translation')
      // find() returns first element in tabKeys array order
      expect(result).toBe('for_media_buyers')
    })
  })

  describe('Priority - direct match over translation', () => {
    it('should not call i18n.t when direct match exists', () => {
      const mockFn = vi.fn()
      Object.defineProperty(i18n, 't', {
        value: mockFn,
        writable: true,
        configurable: true,
      })

      resolveTabKey('for_media_buyers')

      // If direct match exists, i18n.t should not be called at all
      expect(mockFn).not.toHaveBeenCalled()
    })
  })
})
