import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button element with text children', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.textContent).toBe('Click me')
    })

    it('should render element children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>,
      )
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })

    it('should render with empty children', () => {
      render(<Button />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.textContent).toBe('')
    })
  })

  describe('Type attribute', () => {
    it('should have default type "submit"', () => {
      render(<Button>Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should accept custom type "button"', () => {
      render(<Button type="button">Click</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should accept custom type "reset"', () => {
      render(<Button type="reset">Reset</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'reset')
    })
  })

  describe('Styling', () => {
    it('should apply base styling classes', () => {
      render(<Button>Test</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveClass('bg-yellow', 'text-ink')
      expect(button).toHaveClass('hover:bg-purple', 'hover:text-white')
    })

    it('should merge custom className with default classes', () => {
      render(<Button className="custom-class">Test</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveClass('bg-yellow')
      expect(button).toHaveClass('custom-class')
    })

    it('should maintain class order: defaults then custom', () => {
      render(<Button className="custom">Test</Button>)
      const button = screen.getByRole('button')
      const classIndex = {
        default: button.className.indexOf('bg-yellow'),
        custom: button.className.indexOf('custom'),
      }

      expect(classIndex.default).toBeLessThan(classIndex.custom)
    })

    it('should not produce double spaces in className', () => {
      render(<Button>Test</Button>)
      const button = screen.getByRole('button')

      expect(button.className).not.toMatch(/\s{2,}/)
      expect(button.className.trim()).toBe(button.className)
    })

    it('should handle empty string className without extra spaces', () => {
      render(<Button className="">Test</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveClass('bg-yellow')
      expect(button.className).not.toMatch(/\s{2,}/)
    })

    it('should preserve multiple custom classes', () => {
      render(<Button className="class1 class2 class3">Test</Button>)
      const button = screen.getByRole('button')

      expect(button).toHaveClass('class1', 'class2', 'class3')
    })
  })

  describe('Event handlers', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByRole('button')
      await userEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should call onClick handler multiple times', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByRole('button')
      await userEvent.click(button)
      await userEvent.click(button)
      await userEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>,
      )

      const button = screen.getByRole('button')
      await userEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Disabled state', () => {
    it('should have disabled attribute when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not have disabled attribute by default', () => {
      render(<Button>Enabled</Button>)
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should be disabled when disabled prop changes to true', () => {
      const { rerender } = render(<Button disabled={false}>Button</Button>)
      let button = screen.getByRole('button')
      expect(button).not.toBeDisabled()

      rerender(<Button disabled={true}>Button</Button>)
      button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('HTML attribute forwarding', () => {
    it('should forward standard HTML attributes', () => {
      render(
        <Button id="my-button" data-testid="custom-id" aria-label="Action button">
          Test
        </Button>,
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('id', 'my-button')
      expect(button).toHaveAttribute('data-testid', 'custom-id')
      expect(button).toHaveAttribute('aria-label', 'Action button')
    })

    it('should forward aria attributes', () => {
      render(
        <Button aria-pressed="false" aria-describedby="description">
          Toggle
        </Button>,
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-pressed', 'false')
      expect(button).toHaveAttribute('aria-describedby', 'description')
    })

    it('should forward data attributes', () => {
      render(
        <Button data-tracking="click-event" data-value="123">
          Track
        </Button>,
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-tracking', 'click-event')
      expect(button).toHaveAttribute('data-value', '123')
    })

    it('should forward title attribute', () => {
      render(<Button title="Tooltip text">Hover me</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'Tooltip text')
    })

    it('should forward tabIndex', () => {
      render(<Button tabIndex={-1}>Not in tab order</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Edge cases', () => {
    it('should render with numeric children', () => {
      render(<Button>{123}</Button>)
      expect(screen.getByText('123')).toBeInTheDocument()
    })

    it('should handle long text content', () => {
      const longText = 'A'.repeat(100)
      render(<Button>{longText}</Button>)
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      render(<Button>Click & Go → Home!</Button>)
      expect(screen.getByText('Click & Go → Home!')).toBeInTheDocument()
    })

    it('should handle undefined className prop', () => {
      render(<Button className={undefined}>Test</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-yellow')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Press Space</Button>)

      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()

      await userEvent.keyboard(' ')
      expect(handleClick).toHaveBeenCalled()
    })

    it('should support Enter key', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Press Enter</Button>)

      const button = screen.getByRole('button')
      button.focus()

      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalled()
    })

    it('should be focusable', () => {
      render(<Button>Focus me</Button>)
      const button = screen.getByRole('button')

      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('Props combinations', () => {
    it('should handle type and className together', () => {
      render(
        <Button type="button" className="large">
          Large Button
        </Button>,
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveClass('large')
      expect(button).toHaveClass('bg-yellow')
    })

    it('should handle disabled and onClick together', async () => {
      const handleClick = vi.fn()
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      )

      const button = screen.getByRole('button')
      await userEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
      expect(button).toBeDisabled()
    })

    it('should handle all common props together', () => {
      const handleClick = vi.fn()
      render(
        <Button
          type="button"
          className="custom"
          onClick={handleClick}
          id="btn"
          aria-label="Custom button"
          data-test="button"
        >
          Complete Button
        </Button>,
      )

      const button = screen.getByRole('button', { name: 'Custom button' })
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveClass('custom')
      expect(button).toHaveClass('bg-yellow')
      expect(button).toHaveAttribute('id', 'btn')
      expect(button).toHaveAttribute('data-test', 'button')
    })
  })
})
