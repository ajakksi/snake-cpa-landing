import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Preloader from './Preloader'
import gsap from 'gsap'

vi.mock('@components/layout/PageBackground/PageBackground', () => ({
  default: () => null,
}))

vi.mock('gsap', () => {
  const to = vi.fn((target: Record<string, number>, vars: Record<string, unknown>) => {
    ;(vars.onStart as (() => void) | undefined)?.()
    if (typeof vars.currentPercent === 'number') {
      target.currentPercent = vars.currentPercent
    }
    ;(vars.onUpdate as (() => void) | undefined)?.()
    ;(vars.onComplete as (() => void) | undefined)?.()
    return {}
  })

  const timeline = vi.fn(() => {
    const api = {
      to: vi.fn((target: Record<string, number>, vars: Record<string, unknown>) => {
        if (typeof vars.currentPercent === 'number') {
          target.currentPercent = vars.currentPercent
        }
        ;(vars.onUpdate as (() => void) | undefined)?.()
        return api
      }),
      add: vi.fn((callback: () => void) => {
        callback()
        return api
      }),
    }
    return api
  })

  return { default: { to, timeline, killTweensOf: vi.fn() } }
})

const mockGsap = vi.mocked(gsap)

beforeEach(() => {
  vi.clearAllMocks()
  document.body.style.overflow = ''
})

afterEach(() => {
  document.body.style.overflow = ''
})

describe('Preloader', () => {
  it('should render as an accessible, live-updating status region', () => {
    render(<Preloader isReady={false} />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveAttribute('aria-label', 'Loading content')
  })

  it('should lock body scroll while visible', () => {
    render(<Preloader isReady={false} />)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('should climb to phase 1 (75%) and hold at phase 2 (98%) while the app is not ready', () => {
    render(<Preloader isReady={false} />)
    expect(screen.getByText('98%')).toBeInTheDocument()
  })

  it('should skip straight to completion when the app is already ready on mount', () => {
    const onComplete = vi.fn()
    render(<Preloader isReady={true} onComplete={onComplete} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('should complete once readiness arrives while progress is holding at phase 2', () => {
    const onComplete = vi.fn()
    const { rerender } = render(<Preloader isReady={false} onComplete={onComplete} />)
    expect(screen.getByText('98%')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    rerender(<Preloader isReady={true} onComplete={onComplete} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('should cancel the in-progress phase-2 tween before rushing to completion', () => {
    const { rerender } = render(<Preloader isReady={false} />)
    expect(mockGsap.killTweensOf).not.toHaveBeenCalled()

    rerender(<Preloader isReady={true} />)
    expect(mockGsap.killTweensOf).toHaveBeenCalledTimes(1)
  })

  it('should unlock body scroll once it finishes and hides itself', () => {
    render(<Preloader isReady={true} />)
    expect(document.body.style.overflow).toBe('')
  })

  it('should unlock body scroll on unmount even if still visible', () => {
    const { unmount } = render(<Preloader isReady={false} />)
    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('should restart from the beginning if isReady drops back to false after completion', () => {
    const onComplete = vi.fn()
    const { rerender } = render(<Preloader isReady={true} onComplete={onComplete} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)

    // Simulates e.g. a new route load needing the preloader again.
    rerender(<Preloader isReady={false} onComplete={onComplete} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('98%')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    // The earlier completion shouldn't be double-counted.
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
