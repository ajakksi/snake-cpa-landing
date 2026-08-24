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

const { socialLinks } = vi.hoisted(() => ({
  socialLinks: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Twitter', href: 'https://twitter.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
  ],
}))

vi.mock('@data/socialLinks', () => ({ socialLinks }))

vi.mock('@assets/icons/arrow.svg?react', () => ({
  default: (props: Record<string, unknown>) => <span data-testid="arrow-icon" {...props} />,
}))

describe('Footer', () => {
  it('should render as a contentinfo landmark', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should render the social links nav with an accessible label', () => {
    render(<Footer />)
    expect(screen.getByRole('navigation', { name: 'Follow us on social media' })).toBeInTheDocument()
  })

  it.each(socialLinks)('should link to $label at $href', ({ label, href }) => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: new RegExp(label) })).toHaveAttribute('href', href)
  })

  it('should link "Back to top" to the hero section', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /Back to top/ })).toHaveAttribute('href', '#hero')
  })

  it('should give every link an accessible name', () => {
    render(<Footer />)
    screen.getAllByRole('link').forEach((link) => {
      expect(link).toHaveAccessibleName()
    })
  })

  it('should hide the decorative arrow icon from assistive tech', () => {
    render(<Footer />)
    expect(screen.getByTestId('arrow-icon')).toHaveAttribute('aria-hidden', 'true')
  })
})
