import { describe, it, expect } from 'vitest'
import { getLocalizedPath } from './apiPaths'

describe('getLocalizedPath', () => {
  it('should create correct path for English locale', () => {
    const result = getLocalizedPath('en', '/benefits')
    expect(result).toBe('/en/benefits')
  })

  it('should create correct path for Russian locale', () => {
    const result = getLocalizedPath('ru', '/benefits')
    expect(result).toBe('/ru/benefits')
  })

  it('should convert uppercase locale to lowercase', () => {
    const result = getLocalizedPath('EN', '/benefits')
    expect(result).toBe('/en/benefits')
  })

  it('should handle mixed case locale', () => {
    const result = getLocalizedPath('En', '/tasks')
    expect(result).toBe('/en/tasks')
  })

  it('should extract first part of locale with hyphen (en-US -> en)', () => {
    const result = getLocalizedPath('en-US', '/multiply')
    expect(result).toBe('/en/multiply')
  })

  it('should handle locale with hyphen in uppercase', () => {
    const result = getLocalizedPath('RU-RU', '/form')
    expect(result).toBe('/ru/form')
  })

  it('should handle hyphenated locale with multiple separators', () => {
    const result = getLocalizedPath('en-US-variant', '/path')
    expect(result).toBe('/en/path')
  })
  
  it('should handle empty path', () => {
  const result = getLocalizedPath('en', '')
  expect(result).toBe('/en')
})
})
