import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import FullPageScroll from './FullPageScroll'

const gsapTo = vi.fn((target: unknown, vars: Record<string, unknown>) => {
  if (typeof vars.scrollTop === 'number' && target && typeof target === 'object') {
    ;(target as { scrollTop: number }).scrollTop = vars.scrollTop
  }
  ;(vars.onComplete as (() => void) | undefined)?.()
  return { kill: vi.fn() }
})

vi.mock('gsap', () => ({
  default: { to: (...args: [unknown, Record<string, unknown>]) => gsapTo(...args), registerPlugin: vi.fn() },
}))
vi.mock('gsap/ScrollToPlugin', () => ({ ScrollToPlugin: {} }))

const mediaChangeListeners: Array<() => void> = []
const mockAddEventListener = vi.fn((event: string, cb: () => void) => {
  if (event === 'change') mediaChangeListeners.push(cb)
})
const mockRemoveEventListener = vi.fn()
const mockMediaQueryList = {
  matches: true,
  media: '(min-width: 1024px)',
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
}

const setBreakpoint = (isDesktop: boolean) => {
  mockMediaQueryList.matches = isDesktop
  mediaChangeListeners.forEach((cb) => cb())
}

let mockScrollIntoView: ReturnType<typeof vi.fn<typeof Element.prototype.scrollIntoView>>

type SectionOptions = { offsetTop?: number; innerOverflow?: number }

const createSection = (id: string, { offsetTop = 0, innerOverflow = 0 }: SectionOptions = {}) => {
  const section = document.createElement('div')
  section.id = id
  section.setAttribute('data-fullpage-section', '')
  Object.defineProperty(section, 'offsetTop', { value: offsetTop, configurable: true })

  const scroller = document.createElement('div')
  scroller.setAttribute('data-fullpage-scroll', '')
  const clientHeight = 400
  Object.defineProperty(scroller, 'clientHeight', { value: clientHeight, configurable: true })
  Object.defineProperty(scroller, 'scrollHeight', {
    value: clientHeight + innerOverflow,
    configurable: true,
  })

  section.appendChild(scroller)
  document.body.appendChild(section)
  return { section, scroller }
}

const dispatchWheel = (deltaY: number, opts: Partial<WheelEventInit> = {}) => {
  document.body.dispatchEvent(
    new WheelEvent('wheel', { deltaY, cancelable: true, bubbles: true, ...opts }),
  )
}

const createTouchEvent = (type: string, clientY: number) => {
  const event = new Event(type, { cancelable: true, bubbles: true })
  Object.defineProperty(event, 'touches', { value: [{ clientY }], configurable: true })
  return event
}

const dispatchTouchStart = (clientY: number) => {
  document.body.dispatchEvent(createTouchEvent('touchstart', clientY))
}

const dispatchTouchMove = (clientY: number) => {
  document.body.dispatchEvent(createTouchEvent('touchmove', clientY))
}

const dispatchKey = (key: string, target?: EventTarget) => {
  ;(target ?? document.body).dispatchEvent(
    new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true }),
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mediaChangeListeners.length = 0
  mockMediaQueryList.matches = true
  document.body.innerHTML = ''
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  window.matchMedia = vi.fn().mockReturnValue(mockMediaQueryList)
  window.scrollTo = vi.fn()
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  mockScrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = mockScrollIntoView
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('FullPageScroll — desktop/mobile mode setup on mount', () => {
  it('locks page scroll and reports the current section on desktop', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })
    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true })

    const onActiveSectionChange = vi.fn()
    render(<FullPageScroll onActiveSectionChange={onActiveSectionChange} />)

    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.body.style.overflow).toBe('hidden')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 800 })
    expect(onActiveSectionChange).toHaveBeenCalledWith('benefits')
  })

  it('does not lock page scroll on mobile, but still reports the current section', () => {
    mockMediaQueryList.matches = false
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })
    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true })

    const onActiveSectionChange = vi.fn()
    render(<FullPageScroll onActiveSectionChange={onActiveSectionChange} />)

    expect(document.documentElement.style.overflow).toBe('')
    expect(onActiveSectionChange).toHaveBeenCalledWith('benefits')
  })

  it('attaches no listeners and locks nothing when enabled=false', () => {
    createSection('hero')
    const onActiveSectionChange = vi.fn()
    render(<FullPageScroll enabled={false} onActiveSectionChange={onActiveSectionChange} />)

    expect(document.documentElement.style.overflow).toBe('')
    dispatchWheel(500)
    expect(onActiveSectionChange).not.toHaveBeenCalled()
  })
})

describe('FullPageScroll — section transitions via wheel', () => {
  it('transitions to the next section and reports both callbacks', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onActiveSectionChange = vi.fn()
    const onSectionTransitionStart = vi.fn()
    render(
      <FullPageScroll
        onActiveSectionChange={onActiveSectionChange}
        onSectionTransitionStart={onSectionTransitionStart}
      />,
    )
    onActiveSectionChange.mockClear()

    dispatchWheel(500)

    expect(onSectionTransitionStart).toHaveBeenCalledWith('hero', 'benefits')
    expect(onActiveSectionChange).toHaveBeenCalledWith('benefits')
  })

  it('transitions to the previous section on upward wheel', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })
    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchWheel(-500)

    expect(onSectionTransitionStart).toHaveBeenCalledWith('benefits', 'hero')
  })

  it('does not transition past the last section', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })
    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchWheel(500)

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })

  it('blocks a new transition while one is still in flight', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })
    createSection('tasks', { offsetTop: 1600 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    let pendingComplete: (() => void) | undefined
    gsapTo.mockImplementationOnce((_target, vars: Record<string, unknown>) => {
      pendingComplete = vars.onComplete as () => void
      return { kill: vi.fn() }
    })

    dispatchWheel(500) 
    dispatchWheel(500)

    expect(onSectionTransitionStart).toHaveBeenCalledTimes(1)
    expect(onSectionTransitionStart).toHaveBeenCalledWith('hero', 'benefits')

    pendingComplete?.() 
    vi.advanceTimersByTime(150) 
    dispatchWheel(500) 

    expect(onSectionTransitionStart).toHaveBeenCalledTimes(2)
    expect(onSectionTransitionStart).toHaveBeenLastCalledWith('benefits', 'tasks')
  })

  it.each([
    ['the horizontal component dominates', () => dispatchWheel(500, { deltaX: 600 }), false],
    ['a ctrl+wheel (pinch-zoom) gesture is used', () => dispatchWheel(500, { ctrlKey: true }), false],
    ['the wheel originates inside an open dialog', () => {
      const dialog = document.createElement('div')
      dialog.setAttribute('role', 'dialog')
      document.body.appendChild(dialog)
      dialog.dispatchEvent(new WheelEvent('wheel', { deltaY: 500, cancelable: true, bubbles: true }))
    }, false],
    ['the component is suspended', () => dispatchWheel(500), true],
  ])('ignores wheel input when %s', (_label, triggerWheel, suspended) => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll suspended={suspended} onSectionTransitionStart={onSectionTransitionStart} />)

    triggerWheel()

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })

  it('does not animate section transitions via wheel on mobile (scroll is native-only)', () => {
    mockMediaQueryList.matches = false
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    gsapTo.mockClear()
    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchWheel(500)

    
    expect(gsapTo).not.toHaveBeenCalled()
    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })
})

describe('FullPageScroll — inner-scroll vs section-transition routing', () => {
  it('scrolls inside a tall section instead of transitioning, while overflow remains', () => {
    createSection('hero', { offsetTop: 0, innerOverflow: 300 })
    createSection('benefits', { offsetTop: 800 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchWheel(100)

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
    expect(gsapTo).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ scrollTop: 100 }),
    )
  })

  it('transitions to the next section once a fresh wheel gesture arrives at the inner-scroll edge', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    createSection('hero', { offsetTop: 0, innerOverflow: 100 })
    createSection('benefits', { offsetTop: 800 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchWheel(150) // scrolls inside to the edge, consuming this gesture's inner-scroll budget
    expect(onSectionTransitionStart).not.toHaveBeenCalled()

    vi.advanceTimersByTime(150) // let the wheel gesture go idle (120ms)

    dispatchWheel(150) // a fresh gesture, already at the edge, should now transition
    expect(onSectionTransitionStart).toHaveBeenCalledWith('hero', 'benefits')
  })
})

describe('FullPageScroll — touch input', () => {
  it('routes touch drag the same way as wheel, using the accumulated delta', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchTouchStart(500)
    dispatchTouchMove(200) // dragged up by 300px

    expect(onSectionTransitionStart).toHaveBeenCalledWith('hero', 'benefits')
  })

  it('requires crossing the edge-distance threshold before transitioning (unlike wheel)', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchTouchStart(500)
    dispatchTouchMove(490) // 10px, below the transition threshold

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })

  it('does not animate section transitions via touch on mobile (scroll is native-only)', () => {
    mockMediaQueryList.matches = false
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    gsapTo.mockClear()
    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchTouchStart(500)
    dispatchTouchMove(200) // dragged up by 300px (would trigger on desktop)

    // On mobile, touch input is ignored; no GSAP animation is triggered
    expect(gsapTo).not.toHaveBeenCalled()
    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })
})

describe('FullPageScroll — keyboard navigation', () => {
  it.each([
    ['ArrowDown', 'hero', 'benefits'],
    ['PageDown', 'hero', 'benefits'],
  ])('moves forward on %s', (key, from, to) => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchKey(key)

    expect(onSectionTransitionStart).toHaveBeenCalledWith(from, to)
  })

  it('jumps directly to the first section on Home', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })
    createSection('tasks', { offsetTop: 1600 })
    Object.defineProperty(window, 'scrollY', { value: 1600, configurable: true })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchKey('Home')

    expect(onSectionTransitionStart).toHaveBeenCalledWith('tasks', 'hero')
  })

  it('jumps directly to the last section on End', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })
    createSection('tasks', { offsetTop: 1600 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchKey('End')

    expect(onSectionTransitionStart).toHaveBeenCalledWith('hero', 'tasks')
  })

  it('ignores navigation keys while focus is inside a form field', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const input = document.createElement('input')
    document.body.appendChild(input)

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchKey('ArrowDown', input)

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })

  it('ignores navigation keys on mobile', () => {
    mockMediaQueryList.matches = false
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    dispatchKey('ArrowDown')

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })
})

describe('FullPageScroll — anchor clicks', () => {
  it('animates to the target section on desktop and updates the URL hash', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const link = document.createElement('a')
    link.href = '#benefits'
    document.body.appendChild(link)

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState')
    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(onSectionTransitionStart).toHaveBeenCalledWith('hero', 'benefits')
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '#benefits')
  })

  it('uses native smooth scrolling on mobile instead of animating', () => {
    mockMediaQueryList.matches = false
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const link = document.createElement('a')
    link.href = '#benefits'
    document.body.appendChild(link)

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
    expect(mockScrollIntoView).toHaveBeenCalled()
  })

  it('ignores clicks on links that do not match a known section', () => {
    createSection('hero', { offsetTop: 0 })

    const link = document.createElement('a')
    link.href = '#does-not-exist'
    document.body.appendChild(link)

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)

    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })
})

describe('FullPageScroll — suspended blocks every input source', () => {
  it.each([
    [
      'touch drag',
      () => {
        dispatchTouchStart(500)
        dispatchTouchMove(200)
      },
    ],
    ['keyboard navigation', () => dispatchKey('ArrowDown')],
    [
      'an anchor click',
      () => {
        const link = document.createElement('a')
        link.href = '#benefits'
        document.body.appendChild(link)
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      },
    ],
  ])('ignores %s while suspended', (_label, triggerInput) => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onSectionTransitionStart = vi.fn()
    render(<FullPageScroll suspended onSectionTransitionStart={onSectionTransitionStart} />)

    triggerInput()

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })
})

describe('FullPageScroll — native scroll tracking on mobile', () => {
  it('reports the active section as the user scrolls natively on mobile', () => {
    mockMediaQueryList.matches = false
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onActiveSectionChange = vi.fn()
    render(<FullPageScroll onActiveSectionChange={onActiveSectionChange} />)
    onActiveSectionChange.mockClear()

    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true })
    window.dispatchEvent(new Event('scroll'))

    expect(onActiveSectionChange).toHaveBeenCalledWith('benefits')
  })

  it('does not track native scroll on desktop (GSAP owns scrolling there)', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onActiveSectionChange = vi.fn()
    render(<FullPageScroll onActiveSectionChange={onActiveSectionChange} />)
    onActiveSectionChange.mockClear()

    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true })
    window.dispatchEvent(new Event('scroll'))

    expect(onActiveSectionChange).not.toHaveBeenCalled()
  })
})

describe('FullPageScroll — breakpoint changes at runtime', () => {
  it('locks scroll and resyncs when crossing from mobile to desktop', () => {
    mockMediaQueryList.matches = false
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onActiveSectionChange = vi.fn()
    render(<FullPageScroll onActiveSectionChange={onActiveSectionChange} />)
    expect(document.documentElement.style.overflow).toBe('')

    Object.defineProperty(window, 'scrollY', { value: 800, configurable: true })
    setBreakpoint(true)

    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(onActiveSectionChange).toHaveBeenLastCalledWith('benefits')
  })

  it('releases scroll and resyncs when crossing from desktop to mobile', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    render(<FullPageScroll />)
    expect(document.documentElement.style.overflow).toBe('hidden')

    setBreakpoint(false)

    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
  })
})

describe('FullPageScroll — cleanup on unmount', () => {
  it('removes every listener it attached', () => {
    createSection('hero', { offsetTop: 0 })
    const windowRemoveSpy = vi.spyOn(window, 'removeEventListener')
    const documentRemoveSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = render(<FullPageScroll />)
    unmount()

    ;['wheel', 'touchstart', 'touchmove', 'keydown'].forEach((eventName) => {
      expect(windowRemoveSpy).toHaveBeenCalledWith(eventName, expect.any(Function), expect.anything())
    })
    expect(windowRemoveSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(documentRemoveSpy).toHaveBeenCalledWith('click', expect.any(Function))
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('releases the page scroll lock on unmount', () => {
    createSection('hero', { offsetTop: 0 })
    const { unmount } = render(<FullPageScroll />)
    expect(document.documentElement.style.overflow).toBe('hidden')

    unmount()

    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
  })

  it('stops responding to input after unmount', () => {
    createSection('hero', { offsetTop: 0 })
    createSection('benefits', { offsetTop: 800 })

    const onSectionTransitionStart = vi.fn()
    const { unmount } = render(<FullPageScroll onSectionTransitionStart={onSectionTransitionStart} />)
    unmount()

    dispatchWheel(500)

    expect(onSectionTransitionStart).not.toHaveBeenCalled()
  })
})
