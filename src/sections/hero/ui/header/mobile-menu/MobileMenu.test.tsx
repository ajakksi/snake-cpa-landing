import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MobileMenu from './MobileMenu'

let resolvedLanguage = 'en'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.hero': 'MAIN',
        'nav.team': 'TEAM',
        'nav.benefits': 'BENEFITS',
        'nav.joinUs': 'JOIN US',
      }
      return translations[key] || key
    },
    i18n: { resolvedLanguage, language: resolvedLanguage },
  }),
}))

vi.mock('@assets/icons/instagram.svg?react', () => ({ default: () => <span>Instagram</span> }))
vi.mock('@assets/icons/telegram.svg?react', () => ({ default: () => <span>Telegram</span> }))
vi.mock('@assets/icons/linkedin.svg?react', () => ({ default: () => <span>LinkedIn</span> }))

const setResolvedLanguage = (lang: string) => {
  resolvedLanguage = lang
}

describe('MobileMenu', () => {
  it('should render nothing when closed', () => {
    const { container } = render(
      <MobileMenu isOpen={false} onClose={vi.fn()} onLanguageChange={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render the menu content when open', () => {
    setResolvedLanguage('en')
    render(<MobileMenu isOpen={true} onClose={vi.fn()} onLanguageChange={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'MAIN' })).toHaveAttribute('href', '#hero')
    expect(screen.getByRole('link', { name: 'TEAM' })).toHaveAttribute('href', '#team')
  })

  it('should prefix nav links with homePath when provided (e.g. from a non-root locale page)', () => {
    setResolvedLanguage('en')
    render(
      <MobileMenu isOpen={true} onClose={vi.fn()} onLanguageChange={vi.fn()} homePath="/ru" />,
    )

    expect(screen.getByRole('link', { name: 'MAIN' })).toHaveAttribute('href', '/ru#hero')
    expect(screen.getByRole('link', { name: 'TEAM' })).toHaveAttribute('href', '/ru#team')
  })

  it.each([
    ['the overlay is clicked', () => document.querySelector('[role="presentation"]') as Element],
    ['the close button is clicked', () => screen.getByRole('button', { name: '✕' })],
    ['a nav link is clicked', () => screen.getByRole('link', { name: 'TEAM' })],
  ])('should close when %s', async (_label, getTarget) => {
    setResolvedLanguage('en')
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<MobileMenu isOpen={true} onClose={onClose} onLanguageChange={vi.fn()} />)

    await user.click(getTarget())

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should close on Escape while open', () => {
    setResolvedLanguage('en')
    const onClose = vi.fn()
    render(<MobileMenu isOpen={true} onClose={onClose} onLanguageChange={vi.fn()} />)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not respond to Escape once closed, and cleans up its listener', () => {
    setResolvedLanguage('en')
    const onClose = vi.fn()
    const { rerender } = render(
      <MobileMenu isOpen={true} onClose={onClose} onLanguageChange={vi.fn()} />,
    )
    rerender(<MobileMenu isOpen={false} onClose={onClose} onLanguageChange={vi.fn()} />)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should remove its Escape listener on unmount', () => {
    setResolvedLanguage('en')
    const onClose = vi.fn()
    const { unmount } = render(
      <MobileMenu isOpen={true} onClose={onClose} onLanguageChange={vi.fn()} />,
    )
    unmount()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should prevent navigation when a social link is clicked (placeholder hrefs)', () => {
    setResolvedLanguage('en')
    render(<MobileMenu isOpen={true} onClose={vi.fn()} onLanguageChange={vi.fn()} />)

    const instagramLink = screen.getByTitle('Instagram')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    instagramLink.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it.each([
    ['ENG', 'en'],
    ['РУС', 'ru'],
    ['УКР', 'ua'],
  ])('should call onLanguageChange("%s") and close when %s is selected', async (label, lang) => {
    setResolvedLanguage('en')
    const onLanguageChange = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<MobileMenu isOpen={true} onClose={onClose} onLanguageChange={onLanguageChange} />)

    await user.click(screen.getByRole('button', { name: label }))

    expect(onLanguageChange).toHaveBeenCalledWith(lang)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['en', 'ENG', true],
    ['en-US', 'ENG', true],
    ['ru', 'ENG', false],
  ])('should set aria-pressed based on the resolved language ("%s" -> %s active: %s)', (
    lang,
    label,
    expected,
  ) => {
    setResolvedLanguage(lang)
    render(<MobileMenu isOpen={true} onClose={vi.fn()} onLanguageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: label })).toHaveAttribute(
      'aria-pressed',
      String(expected),
    )
  })
})
