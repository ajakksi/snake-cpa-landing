import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotFound from './NotFound'

let resolvedLanguage = 'en'
const changeLanguage = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        homeLabel: 'Go home',
        errorLabel: 'Page not found',
        desktopCta: 'Back to home',
        mobileCta: 'Home',
      }
      return translations[key] || key
    },
    i18n: {
      resolvedLanguage,
      language: resolvedLanguage,
      changeLanguage,
    },
  }),
}))

vi.mock('@components/layout', () => ({
  PageBackground: () => null,
}))

vi.mock('@sections/hero/ui/header/mobile-menu/MobileMenu', () => ({
  default: ({
    isOpen,
    onClose,
    onLanguageChange,
    homePath,
  }: {
    isOpen: boolean
    onClose: () => void
    onLanguageChange: (lang: 'en' | 'ru' | 'ua') => void
    homePath: string
  }) => (
    <div data-testid="mobile-menu" data-open={isOpen} data-home-path={homePath}>
      <button type="button" onClick={onClose}>
        close menu
      </button>
      <button type="button" onClick={() => onLanguageChange('ru')}>
        switch to ru
      </button>
    </div>
  ),
}))

const setResolvedLanguage = (lang: string) => {
  resolvedLanguage = lang
}

beforeEach(() => {
  resolvedLanguage = 'en'
  changeLanguage.mockClear()
  document.documentElement.lang = ''
})

const renderNotFound = () =>
  render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>,
  )

describe('NotFound', () => {
  it('should render the 404 heading with a translated accessible label', () => {
    renderNotFound()
    expect(screen.getByLabelText('Page not found')).toBeInTheDocument()
  })

  it.each([
    ['en', '/'],
    ['ru', '/ru'],
    ['ua', '/ua'],
  ])('should link the logo home to "%s" locale path', (lang, expectedPath) => {
    setResolvedLanguage(lang)
    renderNotFound()

    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', expectedPath)
  })

  it('should point the call-to-action at the same locale-aware home path', () => {
    setResolvedLanguage('ua')
    renderNotFound()

    expect(screen.getByText('Back to home').closest('a')).toHaveAttribute('href', '/ua')
  })

  it('should pass the same home path down to the mobile menu', () => {
    setResolvedLanguage('ua')
    renderNotFound()

    expect(screen.getByTestId('mobile-menu')).toHaveAttribute('data-home-path', '/ua')
  })

  it('should open the mobile menu when "Menu" is clicked, and close it via the menu itself', async () => {
    const user = userEvent.setup()
    renderNotFound()

    expect(screen.getByTestId('mobile-menu')).toHaveAttribute('data-open', 'false')

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByTestId('mobile-menu')).toHaveAttribute('data-open', 'true')

    await user.click(screen.getByRole('button', { name: 'close menu' }))
    expect(screen.getByTestId('mobile-menu')).toHaveAttribute('data-open', 'false')
  })

  it('should change the language and update the document lang attribute', async () => {
    const user = userEvent.setup()
    renderNotFound()

    await user.click(screen.getByRole('button', { name: 'switch to ru' }))

    expect(changeLanguage).toHaveBeenCalledWith('ru')
    expect(document.documentElement.lang).toBe('ru')
  })
})
