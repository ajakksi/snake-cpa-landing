import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import i18n from '@i18n/i18n'

vi.mock('@pages/Home', () => ({
  default: () => <div data-testid="home-page" />,
}))

vi.mock('@pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page" />,
}))

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

let changeLanguageSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  changeLanguageSpy = vi.spyOn(i18n, 'changeLanguage').mockImplementation(
    (() => Promise.resolve(undefined)) as unknown as (lng?: string) => Promise<never>,
  )
  document.documentElement.lang = ''
})

afterEach(() => {
  document.documentElement.lang = ''
  vi.restoreAllMocks()
})

describe('App routing', () => {
  it('should render Home at "/" and set the language to "en"', () => {
    renderAt('/')

    expect(screen.getByTestId('home-page')).toBeInTheDocument()
    expect(changeLanguageSpy).toHaveBeenCalledWith('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it.each(['ru', 'ua'])('should render Home at "/%s" and set the language accordingly', (locale) => {
    renderAt(`/${locale}`)

    expect(screen.getByTestId('home-page')).toBeInTheDocument()
    expect(changeLanguageSpy).toHaveBeenCalledWith(locale)
    expect(document.documentElement.lang).toBe(locale)
  })

  it('should render NotFound at "/en" — English only lives at the root path', () => {
    renderAt('/en')

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    expect(changeLanguageSpy).not.toHaveBeenCalled()
    expect(document.documentElement.lang).toBe('')
  })

  it('should render NotFound for an unsupported locale segment', () => {
    renderAt('/de')

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    expect(changeLanguageSpy).not.toHaveBeenCalled()
  })

  it('should render NotFound for any other unmatched path', () => {
    renderAt('/some/deep/unknown/path')

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
  })
})
