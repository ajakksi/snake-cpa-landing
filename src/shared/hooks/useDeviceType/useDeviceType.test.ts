import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useDeviceType,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  getDeviceType,
} from './useDeviceType'

const originalInnerWidth = window.innerWidth
const originalMatchMedia = window.matchMedia
const originalMaxTouchPoints = navigator.maxTouchPoints

const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

const mockMaxTouchPoints = (points: number) => {
  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: points,
  })
}

const mockMatchMedia = (matchers: Record<string, boolean> = {}) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matchers[query] ?? false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

const resetEnvironment = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: originalInnerWidth,
  })
  window.matchMedia = originalMatchMedia
  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: originalMaxTouchPoints,
  })
  if ('ontouchstart' in window) {
    delete window.ontouchstart
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockMatchMedia()
})

afterEach(() => {
  resetEnvironment()
  vi.useRealTimers()
})

describe('getDeviceType', () => {
  describe('breakpoint boundaries', () => {
    it('767px -> mobile (last mobile pixel)', () => {
      mockInnerWidth(767)
      expect(getDeviceType()).toBe('mobile')
    })

    it('768px -> tablet (first tablet pixel)', () => {
      mockInnerWidth(768)
      expect(getDeviceType()).toBe('tablet')
    })

    it('1023px -> tablet (last tablet pixel)', () => {
      mockInnerWidth(1023)
      expect(getDeviceType()).toBe('tablet')
    })

    it('1024px -> desktop (first desktop pixel, without touch)', () => {
      mockInnerWidth(1024)
      expect(getDeviceType()).toBe('desktop')
    })
  })

  describe('extreme width values', () => {
    it('very small screen (1px) -> mobile', () => {
      mockInnerWidth(1)
      expect(getDeviceType()).toBe('mobile')
    })

    it('very large screen (3840px) without touch -> desktop', () => {
      mockInnerWidth(3840)
      expect(getDeviceType()).toBe('desktop')
    })
  })

  describe('touch device detection at desktop width', () => {
    it('matchMedia (hover: none) matches -> tablet', () => {
      mockInnerWidth(1920)
      mockMatchMedia({ '(hover: none)': true })
      expect(getDeviceType()).toBe('tablet')
    })

    it('matchMedia (pointer: coarse) matches -> tablet', () => {
      mockInnerWidth(1920)
      mockMatchMedia({ '(pointer: coarse)': true })
      expect(getDeviceType()).toBe('tablet')
    })

    it('navigator.maxTouchPoints > 0 -> tablet', () => {
      mockInnerWidth(1920)
      mockMaxTouchPoints(5)
      expect(getDeviceType()).toBe('tablet')
    })

    it('"ontouchstart" in window -> tablet', () => {
      mockInnerWidth(1920)
      window.ontouchstart = () => {}
      expect(getDeviceType()).toBe('tablet')
    })

    it('no touch indicators -> desktop', () => {
      mockInnerWidth(1920)
      mockMaxTouchPoints(0)
      expect(getDeviceType()).toBe('desktop')
    })
  })

  it('touch indicators do not affect mobile/tablet widths (checked only at desktop)', () => {
    mockInnerWidth(320)
    mockMaxTouchPoints(5)
    window.ontouchstart = () => {}
    expect(getDeviceType()).toBe('mobile')
  })
})

describe('useDeviceType', () => {
  it('returns correct device type on first render', () => {
    mockInnerWidth(320)
    const { result } = renderHook(() => useDeviceType())
    expect(result.current).toBe('mobile')
  })

  it('considers touch indicators on first render', () => {
    mockInnerWidth(1920)
    mockMatchMedia({ '(hover: none)': true })
    const { result } = renderHook(() => useDeviceType())
    expect(result.current).toBe('tablet')
  })

  describe('resize event handling', () => {
    it('updates deviceType on width change', () => {
      mockInnerWidth(320)
      const { result } = renderHook(() => useDeviceType())
      expect(result.current).toBe('mobile')

      act(() => {
        mockInnerWidth(1920)
        window.dispatchEvent(new Event('resize'))
      })
      expect(result.current).toBe('desktop')
    })

    it('correctly transitions through all three states', () => {
      mockInnerWidth(320)
      const { result } = renderHook(() => useDeviceType())

      act(() => {
        mockInnerWidth(800)
        window.dispatchEvent(new Event('resize'))
      })
      expect(result.current).toBe('tablet')

      act(() => {
        mockInnerWidth(1920)
        window.dispatchEvent(new Event('resize'))
      })
      expect(result.current).toBe('desktop')

      act(() => {
        mockInnerWidth(100)
        window.dispatchEvent(new Event('resize'))
      })
      expect(result.current).toBe('mobile')
    })
  })

  describe('orientationchange event handling (with 100ms delay)', () => {
    it('updates deviceType after 100ms delay', () => {
      vi.useFakeTimers()
      mockInnerWidth(768)
      const { result } = renderHook(() => useDeviceType())
      expect(result.current).toBe('tablet')

      act(() => {
        mockInnerWidth(1920)
        window.dispatchEvent(new Event('orientationchange'))
      })
      expect(result.current).toBe('tablet')

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current).toBe('desktop')
    })

    it('does not update before 100ms delay', () => {
      vi.useFakeTimers()
      mockInnerWidth(320)
      const { result } = renderHook(() => useDeviceType())

      act(() => {
        mockInnerWidth(1920)
        window.dispatchEvent(new Event('orientationchange'))
        vi.advanceTimersByTime(99)
      })
      expect(result.current).toBe('mobile')

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current).toBe('desktop')
    })
  })

  describe('cleanup on unmount', () => {
    it('removes resize and orientationchange listeners', () => {
      mockInnerWidth(1024)
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useDeviceType())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function))
    })
  })
})

describe('useIsMobile', () => {
  it('returns true for mobile width', () => {
    mockInnerWidth(320)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('returns false for tablet width', () => {
    mockInnerWidth(800)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns false for desktop width', () => {
    mockInnerWidth(1920)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })
})

describe('useIsTablet', () => {
  it('returns true for tablet width', () => {
    mockInnerWidth(800)
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(true)
  })

  it('returns false for mobile width', () => {
    mockInnerWidth(320)
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(false)
  })

  it('returns false for desktop width', () => {
    mockInnerWidth(1920)
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(false)
  })

  it('returns true for desktop width with touch device', () => {
    mockInnerWidth(1920)
    mockMatchMedia({ '(hover: none)': true })
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(true)
  })
})

describe('useIsDesktop', () => {
  it('returns true for desktop width without touch', () => {
    mockInnerWidth(1920)
    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(true)
  })

  it('returns false for mobile width', () => {
    mockInnerWidth(320)
    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(false)
  })

  it('returns false for tablet width', () => {
    mockInnerWidth(800)
    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(false)
  })

  it('returns false for desktop width with touch device', () => {
    mockInnerWidth(1920)
    mockMatchMedia({ '(hover: none)': true })
    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(false)
  })
})
