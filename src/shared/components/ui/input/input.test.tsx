import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import Input from './Input'

describe('Input', () => {
  it('should render a textbox with a visually-hidden label', () => {
    render(<Input label="Username" />)
    const input = screen.getByRole('textbox')
    const label = screen.getByText('Username')

    expect(input).toBeInTheDocument()
    expect(label).toHaveClass('sr-only')
    expect(label.getAttribute('for')).toBe(input.id)
  })

  it('should render an error message only when one is provided', () => {
    const { rerender, container } = render(<Input label="Email" />)
    expect(container.querySelector('p')).not.toBeInTheDocument()

    rerender(<Input label="Email" error="Invalid email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it.each([
    { props: { id: 'custom-id', name: 'user-email' }, expectedId: 'custom-id' },
    { props: { name: 'user-email' }, expectedId: 'user-email' },
    { props: {}, expectedId: 'email-address' },
  ])('should generate the input id as "$expectedId" given $props', ({ props, expectedId }) => {
    render(<Input label="Email Address" {...props} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('id', expectedId)
  })

  it.each([
    ['Invalid', 'true'],
    [undefined, 'false'],
    ['', 'false'],
  ])('should set aria-invalid to %s when error is %j', (error, expected) => {
    render(<Input label="Email" error={error} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', expected)
  })

  it('should merge a custom className with the default styling', () => {
    render(<Input label="Email" className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('should forward arbitrary HTML, aria, and data attributes', () => {
    render(
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        required
        data-testid="email-input"
        aria-describedby="email-help"
        name="user-email"
      />,
    )
    const input = screen.getByRole('textbox')

    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'Enter your email')
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('data-testid', 'email-input')
    expect(input).toHaveAttribute('aria-describedby', 'email-help')
  })

  it('should forward the disabled attribute', () => {
    render(<Input label="Email" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should accept typed input and call onChange', async () => {
    const handleChange = vi.fn()
    render(<Input label="Email" onChange={handleChange} />)
    const input = screen.getByRole('textbox')

    await userEvent.type(input, 'test@example.com')

    expect(input).toHaveValue('test@example.com')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should forward ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input label="Email" ref={ref} defaultValue="test" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.value).toBe('test')
  })
})
