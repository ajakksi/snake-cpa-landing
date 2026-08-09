import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import Input from './Input'

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input label="Email" />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should render label with sr-only class', () => {
      render(<Input label="Username" />)
      const label = screen.getByText('Username')
      expect(label).toHaveClass('sr-only')
    })

    it('should render error message when provided', () => {
      render(<Input label="Email" error="Invalid email" />)
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })

    it('should not render error message when not provided', () => {
      const { container } = render(<Input label="Email" />)
      const errorParagraph = container.querySelector('p')
      expect(errorParagraph).not.toBeInTheDocument()
    })
  })

  describe('ID generation', () => {
    it('should use provided id', () => {
      render(<Input label="Email" id="custom-id" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'custom-id')
    })

    it('should use name prop if id not provided', () => {
      render(<Input label="Email" name="user-email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'user-email')
    })

    it('should generate id from label if neither id nor name provided', () => {
      render(<Input label="Email Address" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'email-address')
    })

    it('should prioritize id over name and label when both provided', () => {
      render(<Input label="Email Address" id="explicit-id" name="user-email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'explicit-id')
    })

    it('should handle label with multiple spaces', () => {
      render(<Input label="First  Name" />)
      const input = screen.getByRole('textbox')
      // \s+ схлопывает подряд идущие пробелы в один дефис
      expect(input).toHaveAttribute('id', 'first-name')
    })

    it('should convert uppercase label to lowercase id', () => {
      render(<Input label="EMAIL" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'email')
    })
  })

  describe('Styling', () => {
    it('should apply base input styling', () => {
      render(<Input label="Email" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveClass('w-full', 'rounded-lg', 'border', 'bg-white')
      expect(input).toHaveClass('border-purple/30')
    })

    it('should apply error styling when error provided', () => {
      render(<Input label="Email" error="Required" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveClass('border-red-500')
      expect(input).toHaveClass('focus:border-red-500')
    })

    // Известный баг компонента: при error одновременно присутствуют
    // border-purple/30 + border-red-500 (и focus-варианты), т.к. классы
    // накапливаются, а не взаимоисключают друг друга. Тест фиксирует
    // текущее (пока не исправленное) поведение — тот же баг, что и в Select.
    it('should NOT remove default border classes when error is present (known conflict)', () => {
      render(<Input label="Email" error="Required" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveClass('border-purple/30')
      expect(input).toHaveClass('border-red-500')
    })

    it('should apply default focus styling without error', () => {
      render(<Input label="Email" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveClass('focus:border-purple')
    })

    it('should apply custom className', () => {
      render(<Input label="Email" className="custom-class" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveClass('custom-class')
      expect(input).toHaveClass('w-full')
    })

    it('should handle empty className prop', () => {
      render(<Input label="Email" className="" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveClass('w-full', 'rounded-lg')
    })
  })

  describe('Error state', () => {
    it('should set aria-invalid to true when error provided', () => {
      render(<Input label="Email" error="Invalid" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should set aria-invalid to false when no error', () => {
      render(<Input label="Email" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('should set aria-invalid to false when error is empty string', () => {
      render(<Input label="Email" error="" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('should display error message with correct styling', () => {
      render(<Input label="Email" error="This field is required" />)
      const errorMessage = screen.getByText('This field is required')

      expect(errorMessage).toHaveClass('text-red-600', 'text-[0.6rem]')
    })
  })

  describe('Input props forwarding', () => {
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
      expect(input).toHaveAttribute('name', 'user-email')
    })

    it('should forward disabled attribute', () => {
      render(<Input label="Email" disabled />)
      const input = screen.getByRole('textbox')

      expect(input).toBeDisabled()
    })
  })

  describe('User interaction', () => {
    it('should accept text input', async () => {
      render(<Input label="Email" />)
      const input = screen.getByRole('textbox')

      await userEvent.type(input, 'test@example.com')

      expect((input as HTMLInputElement).value).toBe('test@example.com')
    })

    it('should call onChange handler', async () => {
      const handleChange = vi.fn()
      render(<Input label="Email" onChange={handleChange} />)
      const input = screen.getByRole('textbox')

      await userEvent.type(input, 'a')

      expect(handleChange).toHaveBeenCalled()
    })

    it('should call onFocus handler', async () => {
      const handleFocus = vi.fn()
      render(<Input label="Email" onFocus={handleFocus} />)
      const input = screen.getByRole('textbox')

      await userEvent.click(input)

      expect(handleFocus).toHaveBeenCalled()
    })

    it('should call onBlur handler', async () => {
      const handleBlur = vi.fn()
      render(<Input label="Email" onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')

      await userEvent.click(input)
      await userEvent.tab()

      expect(handleBlur).toHaveBeenCalled()
    })

    it('should be focusable', () => {
      render(<Input label="Email" />)
      const input = screen.getByRole('textbox')

      input.focus()

      expect(input).toHaveFocus()
    })
  })

  describe('ForwardRef', () => {
    it('should forward ref to input element', () => {
      const ref = createRef<HTMLInputElement>()
      render(<Input label="Email" ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.tagName).toBe('INPUT')
    })

    it('should allow direct access to input value through ref', () => {
      const ref = createRef<HTMLInputElement>()
      render(<Input label="Email" ref={ref} defaultValue="test" />)

      expect(ref.current?.value).toBe('test')
    })

    it('should allow setting focus through ref', () => {
      const ref = createRef<HTMLInputElement>()
      render(<Input label="Email" ref={ref} />)

      ref.current?.focus()

      expect(ref.current).toHaveFocus()
    })
  })

  describe('Label and accessibility', () => {
    it('should render label with sr-only visibility', () => {
      const { container } = render(<Input label="Email Address" />)
      const label = container.querySelector('label.sr-only')

      expect(label).toBeInTheDocument()
      expect(label).toHaveTextContent('Email Address')
    })

    it('should generate matching id and label text', () => {
      const { container } = render(<Input label="Phone Number" />)
      const input = screen.getByRole('textbox')
      const label = container.querySelector('label')

      expect(label?.textContent).toBe('Phone Number')
      expect(input.id).toBe('phone-number')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty error string', () => {
      const { container } = render(<Input label="Email" error="" />)
      const errorParagraph = container.querySelector('p')

      expect(errorParagraph).not.toBeInTheDocument()
    })

    it('should handle long error message', () => {
      const longError = 'A'.repeat(200)
      render(<Input label="Email" error={longError} />)
      const errorMessage = screen.getByText(longError)

      expect(errorMessage).toBeInTheDocument()
    })

    it('should handle password input type', () => {
      const { container } = render(<Input label="Password" type="password" />)
      const input = container.querySelector('input[type="password"]')

      expect(input).toBeInTheDocument()
    })

    it('should handle number input type', () => {
      const { container } = render(<Input label="Age" type="number" />)
      const input = container.querySelector('input[type="number"]')

      expect(input).toBeInTheDocument()
    })

    it('should handle multiple prop changes', () => {
      const { rerender } = render(<Input label="Email" />)
      let input = screen.getByRole('textbox')

      expect(input).not.toHaveAttribute('disabled')

      rerender(<Input label="Email" disabled />)
      input = screen.getByRole('textbox')

      expect(input).toHaveAttribute('disabled')
    })
  })

  describe('Placeholder and text', () => {
    it('should display placeholder text', () => {
      render(<Input label="Email" placeholder="you@example.com" />)
      const input = screen.getByPlaceholderText('you@example.com')

      expect(input).toBeInTheDocument()
    })

    it('should have correct placeholder styling class', () => {
      render(<Input label="Email" placeholder="test" />)
      const input = screen.getByRole('textbox')

      expect(input).toHaveClass('placeholder:text-dark')
    })
  })
})
