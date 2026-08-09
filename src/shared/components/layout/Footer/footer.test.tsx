import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from './Footer'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'footer.socialsLabel': 'Follow us on social media',
        'footer.backToTop': 'Back to top',
      }
      return translations[key] || key
    },
  }),
}))

vi.mock('@data/socialLinks', () => ({
  socialLinks: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Twitter', href: 'https://twitter.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
  ],
}))

vi.mock('@assets/icons/arrow.svg?react', () => ({
  default: () => <span data-testid="arrow-icon">↑</span>,
}))

describe('Footer', () => {
  describe('Rendering', () => {
    it('should render footer as semantic contentinfo landmark', () => {
      render(<Footer />)
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
    })

    it('should render social links navigation with accessible label', () => {
      render(<Footer />)
      const nav = screen.getByRole('navigation', { name: 'Follow us on social media' })
      expect(nav).toBeInTheDocument()
    })

    it('should render all social links', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /Instagram/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Twitter/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /LinkedIn/ })).toBeInTheDocument()
    })

    it('should render back to top link', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /Back to top/ })).toBeInTheDocument()
    })

    it('should render arrow icon inside back to top link', () => {
      render(<Footer />)
      const backToTopLink = screen.getByRole('link', { name: /Back to top/ })
      expect(backToTopLink.querySelector('[data-testid="arrow-icon"]')).toBeInTheDocument()
    })
  })

  describe('Link destinations (data)', () => {
    it('should have correct href for Instagram link', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /Instagram/ })).toHaveAttribute(
        'href',
        'https://instagram.com',
      )
    })

    it('should have correct href for Twitter link', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /Twitter/ })).toHaveAttribute(
        'href',
        'https://twitter.com',
      )
    })

    it('should have correct href for LinkedIn link', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
        'href',
        'https://linkedin.com',
      )
    })

    it('should link back to top to the hero section', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /Back to top/ })).toHaveAttribute('href', '#hero')
    })

    it('should not open social links in a new tab by default', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: /Instagram/ })).not.toHaveAttribute('target')
    })
  })

  describe('Accessibility', () => {
    it('should give every link an accessible name', () => {
      render(<Footer />)
      const links = screen.getAllByRole('link')
      links.forEach((link) => {
        expect(link).toHaveAccessibleName()
      })
    })

    it('should render arrow icon as decorative element', () => {
      render(<Footer />)
      const arrowIcon = screen.getByTestId('arrow-icon')
      expect(arrowIcon).toBeInTheDocument()
    })

    it('should make links focus-visible for keyboard navigation', () => {
      render(<Footer />)
      const links = screen.getAllByRole('link')
      links.forEach((link) => {
        expect(link).toHaveClass('focus-visible:outline')
      })
    })
  })

  describe('Internationalization', () => {
    it('should use translated strings for nav label and back-to-top text', () => {
      render(<Footer />)
      expect(
        screen.getByRole('navigation', { name: 'Follow us on social media' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Back to top')).toBeInTheDocument()
    })
  })

  describe('Responsive visibility', () => {
    it('should be hidden on small screens and shown from md breakpoint up', () => {
      const { container } = render(<Footer />)
      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('hidden', 'md:block')
    })
  })
})
