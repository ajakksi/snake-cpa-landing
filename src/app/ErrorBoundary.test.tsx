import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from './ErrorBoundary'

vi.mock('@components/layout', () => ({
  PageBackground: () => null,
}))

function ThrowingChild(): never {
  throw new Error('Boom')
}

let reloadSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})

  reloadSpy = vi.fn()
  Object.defineProperty(window, 'location', {
    value: { ...window.location, reload: reloadSpy },
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('should render children normally when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('All good')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('should render the fallback UI when a child throws during render', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.queryByText('All good')).not.toBeInTheDocument()
  })

  it('should log the caught error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      'Unhandled React error',
      expect.any(Error),
      expect.anything(),
    )
  })

  it('should reload the page when "Try again" is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(reloadSpy).toHaveBeenCalledTimes(1)
  })

  it('should link "Home" back to the root of the site', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
  })

  it('should keep showing the fallback on rerender, even once children stop throwing', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    rerender(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
