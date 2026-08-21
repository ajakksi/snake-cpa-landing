import { describe, it, expect, afterEach, vi } from 'vitest'
import { resolveTabKey } from './resolveTabKey'
import i18n from '@i18n/i18n'

vi.mock('@i18n/i18n')

const originalI18nT = i18n.t

const mockI18nT = (translationMap: Record<string, string>) => {
  Object.defineProperty(i18n, 't', {
    value: vi.fn((key: string) => translationMap[key] || key),
    writable: true,
    configurable: true,
  })
}

afterEach(() => {
  Object.defineProperty(i18n, 't', {
    value: originalI18nT,
    writable: true,
    configurable: true,
  })
})

describe('resolveTabKey', () => {
  it('should return undefined for an undefined or empty title', () => {
    expect(resolveTabKey(undefined)).toBeUndefined()
    expect(resolveTabKey('')).toBeUndefined()
  })

  it.each(['for_media_buyers', 'for_businesses', 'for_partners'] as const)(
    'should match "%s" directly, without needing a translation lookup',
    (key) => {
      expect(resolveTabKey(key)).toBe(key)
    },
  )

  it('should find the matching key by its translated label', () => {
    mockI18nT({
      'joinUs:tabs.for_media_buyers': 'Media Buyers',
      'joinUs:tabs.for_businesses': 'Businesses',
      'joinUs:tabs.for_partners': 'Partners',
    })

    expect(resolveTabKey('Media Buyers')).toBe('for_media_buyers')
    expect(resolveTabKey('Businesses')).toBe('for_businesses')
    expect(resolveTabKey('Partners')).toBe('for_partners')
  })

  it('should return undefined when the title matches neither a key nor a translation', () => {
    mockI18nT({
      'joinUs:tabs.for_media_buyers': 'Buyers',
      'joinUs:tabs.for_businesses': 'Business',
      'joinUs:tabs.for_partners': 'Partners',
    })

    expect(resolveTabKey('unknown_title')).toBeUndefined()
    expect(resolveTabKey('Completely different text')).toBeUndefined()
  })

  it('should not match on a partial substring of a translation', () => {
    mockI18nT({
      'joinUs:tabs.for_media_buyers': 'For Media Buyers',
      'joinUs:tabs.for_businesses': 'For Businesses',
      'joinUs:tabs.for_partners': 'For Partners',
    })

    expect(resolveTabKey('Media')).toBeUndefined()
  })

  it('should be case-sensitive for the direct key match', () => {
    expect(resolveTabKey('FOR_MEDIA_BUYERS')).toBeUndefined()
  })

  it('should not trim surrounding whitespace before matching a translation', () => {
    mockI18nT({ 'joinUs:tabs.for_media_buyers': 'Buyers' })
    expect(resolveTabKey(' Buyers ')).toBeUndefined()
  })

  it('should resolve to the first key when multiple translations collide', () => {
    mockI18nT({
      'joinUs:tabs.for_media_buyers': 'same_translation',
      'joinUs:tabs.for_businesses': 'same_translation',
      'joinUs:tabs.for_partners': 'same_translation',
    })

    expect(resolveTabKey('same_translation')).toBe('for_media_buyers')
  })
})