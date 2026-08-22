import { describe, it, expect } from 'vitest'
import { isSupportedLocale, resources, type SupportedLocale } from './i18n'

const supportedLocales = Object.keys(resources) as SupportedLocale[]

describe('isSupportedLocale', () => {
  it.each(supportedLocales)('should return true for "%s"', (locale) => {
    expect(isSupportedLocale(locale)).toBe(true)
  })

  it.each([
    'de',
    'fr',
    'es',
    'en-US',
    'ru-RU',
    '',
    ' en',
    'en ',
    'en!',
    'en_US',
    'e',
    'ruby',
  ])('should return false for "%s"', (locale) => {
    expect(isSupportedLocale(locale)).toBe(false)
  })

  it('should be case-sensitive', () => {
    expect(isSupportedLocale('EN')).toBe(false)
    expect(isSupportedLocale('En')).toBe(false)
    expect(isSupportedLocale('RU')).toBe(false)
  })

  it('should reject inherited Object properties (prototype pollution guard)', () => {
    // These exist on Object.prototype — a naive `locale in resources` check
    // would incorrectly treat them as supported locales.
    expect(isSupportedLocale('toString')).toBe(false)
    expect(isSupportedLocale('constructor')).toBe(false)
    expect(isSupportedLocale('hasOwnProperty')).toBe(false)
    expect(isSupportedLocale('__proto__')).toBe(false)
  })

  it('should recognize exactly the locales defined in `resources`, no more and no less', () => {
    // Derived from `resources` rather than a hardcoded list/count, so this
    // doesn't need updating (or silently go stale) every time a locale is added.
    const candidates = [...supportedLocales, 'de', 'fr', 'toString', 'constructor']
    expect(candidates.filter(isSupportedLocale)).toEqual(supportedLocales)
  })
})