import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnimatedWord from './AnimatedWord'

vi.mock('gsap', () => ({
  default: {
    context: vi.fn((callback: () => void) => {
      callback()
      return { revert: vi.fn() }
    }),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn(function (this: typeof Object) {
        return this
      }),
      set: vi.fn(function (this: typeof Object) {
        return this
      }),
    })),
  },
}))

describe('AnimatedWord', () => {
  it('should render without throwing', () => {
    expect(() => render(<AnimatedWord />)).not.toThrow()
  })

  it('should expose a static word to screen readers', () => {
    render(<AnimatedWord />)
    expect(screen.getByText('profit', { selector: '.sr-only' })).toBeInTheDocument()
  })

  it('should hide the decorative animated content from assistive tech', () => {
    const { container } = render(<AnimatedWord />)
    const hiddenNodes = container.querySelectorAll('[aria-hidden="true"]')

    expect(hiddenNodes.length).toBeGreaterThan(0)
    hiddenNodes.forEach((node) => expect(node).toHaveAttribute('aria-hidden', 'true'))
  })

  it('should include every animated word in its content', () => {
    const { container } = render(<AnimatedWord />)
    const text = container.textContent ?? ''

    ;['profit', 'skills', 'growth'].forEach((word) => {
      expect(text).toContain(word)
    })
  })

  it('should clean up the GSAP animation context on unmount without throwing', () => {
    const { unmount } = render(<AnimatedWord />)
    expect(() => unmount()).not.toThrow()
  })
})
