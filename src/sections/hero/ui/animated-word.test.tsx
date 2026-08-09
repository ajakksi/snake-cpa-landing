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
  describe('Rendering', () => {
    it('should render without errors', () => {
      expect(() => render(<AnimatedWord />)).not.toThrow()
    })

    it('should render root span with correct styling and inline transform/lineHeight', () => {
      const { container } = render(<AnimatedWord />)
      const root = container.querySelector('span[class*="relative"]')

      expect(root).toBeInTheDocument()
      expect(root).toHaveClass('relative', 'inline-block', 'text-yellow', 'overflow-hidden')
      expect(root).toHaveStyle({ lineHeight: '1' })
    })
  })

  describe('Accessibility', () => {
    it('should render sr-only text for screen readers', () => {
      render(<AnimatedWord />)
      const srOnly = screen.getByText('profit', { selector: '.sr-only' })
      expect(srOnly).toBeInTheDocument()
      expect(srOnly).toHaveClass('sr-only')
    })

    it('should hide invisible measurement grid from assistive tech', () => {
      const { container } = render(<AnimatedWord />)
      const grid = container.querySelector('.invisible.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveAttribute('aria-hidden', 'true')
    })

    it('should hide animated list from assistive tech', () => {
      const { container } = render(<AnimatedWord />)
      const list = container.querySelector('[class*="absolute"][class*="left-0"]')
      expect(list).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Words rendering', () => {
    it('should render correct words in the invisible measurement grid', () => {
      const { container } = render(<AnimatedWord />)
      const grid = container.querySelector('.invisible.grid')
      const words = Array.from(grid?.querySelectorAll('span.whitespace-nowrap') || []).map(
        (el) => el.textContent,
      )
      expect(words).toEqual(['profit', 'skills', 'growth'])
    })

    it('should render sequence with repeated first word in animated list (for seamless loop)', () => {
      const { container } = render(<AnimatedWord />)
      const list = container.querySelector('[class*="absolute"][class*="left-0"]')
      const words = Array.from(list?.querySelectorAll('span.whitespace-nowrap') || []).map(
        (el) => el.textContent,
      )
      expect(words).toEqual(['profit', 'skills', 'growth', 'profit'])
    })
  })

  describe('Structure and positioning', () => {
    it('should stack invisible words on the same grid area for measurement', () => {
      const { container } = render(<AnimatedWord />)
      const grid = container.querySelector('.invisible.grid')
      const words = grid?.querySelectorAll('span[style*="grid-area"]')

      // Явно убеждаемся, что нашли элементы, а не проверяем пустой forEach
      expect(words?.length).toBeGreaterThan(0)
      words?.forEach((word) => {
        expect(word).toHaveStyle({ gridArea: '1 / 1' })
      })
    })

    it('should have animated list as absolute positioned flex column with lineHeight 1', () => {
      const { container } = render(<AnimatedWord />)
      const list = container.querySelector('[class*="absolute"][class*="left-0"]')

      expect(list).toHaveClass('absolute', 'left-0', 'top-0', 'flex', 'flex-col')
      expect(list).toHaveStyle({ lineHeight: '1' })
    })

    it('should preserve whitespace for all word spans', () => {
      const { container } = render(<AnimatedWord />)
      const allWords = container.querySelectorAll('span.whitespace-nowrap')
      expect(allWords.length).toBeGreaterThan(0)
      allWords.forEach((word) => {
        expect(word).toHaveClass('whitespace-nowrap')
      })
    })
  })

  describe('Animation lifecycle', () => {
    it('should cleanup animation context on unmount without throwing', () => {
      const { unmount } = render(<AnimatedWord />)
      expect(() => unmount()).not.toThrow()
    })
  })
})
