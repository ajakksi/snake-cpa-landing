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

  describe('touch device detection at desktop width', () => {
    it.each([
      ['matchMedia (hover: none)', () => mockMatchMedia({ '(hover: none)': true })],
      ['matchMedia (pointer: coarse)', () => mockMatchMedia({ '(pointer: coarse)': true })],
      ['navigator.maxTouchPoints > 0', () => mockMaxTouchPoints(5)],
      ['"ontouchstart" in window', () => (window.ontouchstart = () => {})],
    ])('%s -> tablet', (_label, setup) => {
      mockInnerWidth(1920)
      setup()
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

  it('updates through all three states as the width changes', () => {
    mockInnerWidth(320)
    const { result } = renderHook(() => useDeviceType())
    expect(result.current).toBe('mobile')

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

    it('does not update before the 100ms delay elapses', () => {
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

  it('removes resize and orientationchange listeners on unmount', () => {
    mockInnerWidth(1024)
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useDeviceType())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function))
  })
})

describe('useIsMobile', () => {
  it('returns true at mobile width', () => {
    mockInnerWidth(320)
    expect(renderHook(() => useIsMobile()).result.current).toBe(true)
  })

  it('returns false at desktop width', () => {
    mockInnerWidth(1920)
    expect(renderHook(() => useIsMobile()).result.current).toBe(false)
  })
})

describe('useIsTablet', () => {
  it('returns true at tablet width', () => {
    mockInnerWidth(800)
    expect(renderHook(() => useIsTablet()).result.current).toBe(true)
  })

  it('returns true at desktop width when the device is touch-capable', () => {
    mockInnerWidth(1920)
    mockMatchMedia({ '(hover: none)': true })
    expect(renderHook(() => useIsTablet()).result.current).toBe(true)
  })

  it('returns false at desktop width without touch', () => {
    mockInnerWidth(1920)
    expect(renderHook(() => useIsTablet()).result.current).toBe(false)
  })
})

describe('useIsDesktop', () => {
  it('returns true at desktop width without touch', () => {
    mockInnerWidth(1920)
    expect(renderHook(() => useIsDesktop()).result.current).toBe(true)
  })

  it('returns false at desktop width when the device is touch-capable', () => {
    mockInnerWidth(1920)
    mockMatchMedia({ '(hover: none)': true })
    expect(renderHook(() => useIsDesktop()).result.current).toBe(false)
  })
})
