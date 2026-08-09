import { describe, it, expect } from 'vitest'
import { isSupportedLocale, type SupportedLocale } from './i18n'

describe('isSupportedLocale', () => {
  describe('Supported locales', () => {
    it('should return true for "en"', () => {
      expect(isSupportedLocale('en')).toBe(true)
    })

    it('should return true for "ru"', () => {
      expect(isSupportedLocale('ru')).toBe(true)
    })

    it('should work as type guard', () => {
      const locale = 'en' as string
      if (isSupportedLocale(locale)) {
        const typedLocale: SupportedLocale = locale
        expect(typedLocale).toBe('en')
      } else {
        throw new Error('Type guard failed')
      }
    })
  })

  describe('Unsupported locales', () => {
    it('should return false for unknown locales', () => {
      expect(isSupportedLocale('de')).toBe(false)
      expect(isSupportedLocale('fr')).toBe(false)
      expect(isSupportedLocale('es')).toBe(false)
    })

    it('should return false for regional variants', () => {
      expect(isSupportedLocale('en-US')).toBe(false)
      expect(isSupportedLocale('ru-RU')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isSupportedLocale('')).toBe(false)
    })

    it('should be case-sensitive', () => {
      expect(isSupportedLocale('en')).toBe(true)
      expect(isSupportedLocale('EN')).toBe(false)
      expect(isSupportedLocale('En')).toBe(false)
      expect(isSupportedLocale('eN')).toBe(false)

      expect(isSupportedLocale('ru')).toBe(true)
      expect(isSupportedLocale('RU')).toBe(false)
      expect(isSupportedLocale('Ru')).toBe(false)
    })
  })

  describe('Object.hasOwn protection (prototype pollution guard)', () => {
    it('should return false for inherited Object properties', () => {
      // These are inherited from Object.prototype and should NOT be treated as locales
      expect(isSupportedLocale('toString')).toBe(false)
      expect(isSupportedLocale('constructor')).toBe(false)
      expect(isSupportedLocale('hasOwnProperty')).toBe(false)
      expect(isSupportedLocale('valueOf')).toBe(false)
      expect(isSupportedLocale('__proto__')).toBe(false)
    })

    it('should use hasOwn semantics, not "in" operator', () => {
      // If code used "locale in resources" instead of Object.hasOwn(resources, locale),
      // inherited properties would incorrectly return true
      // This test guards against that regression
      const testedLocale = 'toString'
      const result = isSupportedLocale(testedLocale)

      // Verify we're using hasOwn (strict own property check)
      expect(result).toBe(false)
      expect(Object.hasOwn({}, testedLocale)).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should return false for strings with whitespace', () => {
      expect(isSupportedLocale(' en')).toBe(false)
      expect(isSupportedLocale('en ')).toBe(false)
      expect(isSupportedLocale(' en ')).toBe(false)
    })

    it('should return false for strings with special characters', () => {
      expect(isSupportedLocale('en!')).toBe(false)
      expect(isSupportedLocale('en_US')).toBe(false)
      expect(isSupportedLocale('en.US')).toBe(false)
    })

    it('should return false for partial and combined matches', () => {
      expect(isSupportedLocale('e')).toBe(false)
      expect(isSupportedLocale('en_locale')).toBe(false)
      expect(isSupportedLocale('ruby')).toBe(false)
    })
  })

  describe('Type narrowing with filter', () => {
    it('should narrow types when used as filter predicate', () => {
      const locales = ['en', 'de', 'ru', 'fr']
      const supported = locales.filter(isSupportedLocale)

      // Type-safe: supported is now SupportedLocale[]
      expect(supported).toEqual(['en', 'ru'])
      expect(supported.length).toBe(2)
    })
  })

  describe('Only 2 supported locales exist', () => {
    it('should have exactly 2 supported locales across common variants', () => {
      // Test against common locales to ensure only en and ru are supported
      const commonLocales = [
        'en', 'ru', 'de', 'fr', 'es', 'it', 'pt',
        'zh', 'ja', 'ko', 'ar', 'hi', 'pl', 'tr',
      ]

      const supported = commonLocales.filter(isSupportedLocale)
      expect(supported).toHaveLength(2)
      expect(supported).toEqual(['en', 'ru'])
    })
  })
})
