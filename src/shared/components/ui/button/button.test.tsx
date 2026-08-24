import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should default to type="submit"', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('should accept a custom type', () => {
    render(<Button type="button">Click</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('should merge a custom className with default styling', () => {
    render(<Button className="custom-class">Test</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await userEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be keyboard accessible (Space/Enter)', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Press</Button>)

    const button = screen.getByRole('button')
    button.focus()
    expect(button).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
    )

    await userEvent.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should render as disabled when the disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should forward standard HTML/ARIA attributes', () => {
    render(
      <Button id="my-button" aria-label="Action button" data-testid="custom-id">
        Test
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Action button' })
    expect(button).toHaveAttribute('id', 'my-button')
    expect(button).toHaveAttribute('data-testid', 'custom-id')
  })
})
