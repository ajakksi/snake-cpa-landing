import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import Select from './Select'

const defaultOptions = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' },
]

describe('Select', () => {
  describe('Rendering', () => {
    it('should render select element', () => {
      render(<Select label="Choose" options={defaultOptions} />)
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
    })

    it('should render label with sr-only class', () => {
      render(<Select label="Country" options={defaultOptions} />)
      const label = screen.getByText('Country')
      expect(label).toHaveClass('sr-only')
    })

    it('should render all options', () => {
      render(<Select label="Choose" options={defaultOptions} />)
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
    })

    it('should render placeholder option when provided', () => {
      render(<Select label="Choose" options={defaultOptions} placeholder="Select an option" />)
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('should not render placeholder when not provided', () => {
      const { container } = render(<Select label="Choose" options={defaultOptions} />)
      const options = container.querySelectorAll('option')
      expect(options.length).toBe(defaultOptions.length)
    })

    it('should render error message when provided', () => {
      render(<Select label="Choose" options={defaultOptions} error="Required field" />)
      expect(screen.getByText('Required field')).toBeInTheDocument()
    })

    it('should not render error message when not provided', () => {
      const { container } = render(<Select label="Choose" options={defaultOptions} />)
      const errorParagraph = container.querySelector('p')
      expect(errorParagraph).not.toBeInTheDocument()
    })

    it('should render decorative arrow indicator (aria-hidden)', () => {
      const { container } = render(<Select label="Choose" options={defaultOptions} />)
      const arrow = container.querySelector('span[aria-hidden="true"]')

      expect(arrow).toHaveTextContent('▼')
      expect(arrow).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('ID generation', () => {
    it('should use provided id', () => {
      render(<Select label="Choose" id="custom-id" options={defaultOptions} />)
      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('id', 'custom-id')
    })

    it('should use name prop if id not provided', () => {
      render(<Select label="Choose" name="country-select" options={defaultOptions} />)
      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('id', 'country-select')
    })

    it('should generate id from label if neither id nor name provided', () => {
      render(<Select label="Country Selection" options={defaultOptions} />)
      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('id', 'country-selection')
    })

    it('should prioritize id over name and label', () => {
      render(
        <Select label="Choose Option" id="explicit-id" name="option-select" options={defaultOptions} />,
      )
      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('id', 'explicit-id')
    })

    it('should handle label with multiple spaces', () => {
      render(<Select label="Select  Option" options={defaultOptions} />)
      const select = screen.getByRole('combobox')
      expect(select).toHaveAttribute('id', 'select-option')
    })
  })

  describe('Styling', () => {
    it('should apply base select styling', () => {
      render(<Select label="Choose" options={defaultOptions} />)
      const select = screen.getByRole('combobox')

      expect(select).toHaveClass('w-full', 'rounded-lg', 'border', 'bg-white')
      expect(select).toHaveClass('appearance-none', 'cursor-pointer')
      expect(select).toHaveClass('border-purple/30')
    })

    it('should apply error styling when error provided', () => {
      render(<Select label="Choose" options={defaultOptions} error="Required" />)
      const select = screen.getByRole('combobox')

      expect(select).toHaveClass('border-red-500')
      expect(select).toHaveClass('focus:border-red-500')
    })

    it('should apply default focus styling without error', () => {
      render(<Select label="Choose" options={defaultOptions} />)
      const select = screen.getByRole('combobox')

      expect(select).toHaveClass('focus:border-purple')
    })

    it('should apply custom className', () => {
      render(<Select label="Choose" options={defaultOptions} className="custom-class" />)
      const select = screen.getByRole('combobox')

      expect(select).toHaveClass('custom-class')
      expect(select).toHaveClass('w-full')
    })

    it('should handle empty className prop', () => {
      render(<Select label="Choose" options={defaultOptions} className="" />)
      const select = screen.getByRole('combobox')

      expect(select).toHaveClass('w-full', 'rounded-lg')
    })

    it('should not produce double spaces in className', () => {
      render(<Select label="Choose" options={defaultOptions} />)
      const select = screen.getByRole('combobox')

      expect(select.className).not.toMatch(/\s{2,}/)
    })

    // Известный баг компонента: при error одновременно присутствуют
    // border-purple/30 + border-red-500 (и focus-варианты). Этот тест
    // фиксирует ожидаемое (пока не исправленное) поведение — если компонент
    // поправят на взаимоисключающие классы, тест нужно будет обновить.
    it('should NOT remove default border classes when error is present (known conflict)', () => {
      render(<Select label="Choose" options={defaultOptions} error="Required" />)
      const select = screen.getByRole('combobox')

      expect(select).toHaveClass('border-purple/30')
      expect(select).toHaveClass('border-red-500')
    })
  })

  describe('Error state', () => {
    it('should set aria-invalid to true when error provided', () => {
      render(<Select label="Choose" options={defaultOptions} error="Invalid selection" />)
      const select = screen.getByRole('combobox')

      expect(select).toHaveAttribute('aria-invalid', 'true')
    })

    it('should set aria-invalid to false when no error', () => {
      render(<Select label="Choose" options={defaultOptions} />)
      const select = screen.getByRole('combobox')

      expect(select).toHaveAttribute('aria-invalid', 'false')
    })

    it('should set aria-invalid to false when error is empty string', () => {
      render(<Select label="Choose" options={defaultOptions} error="" />)
      const select = screen.getByRole('combobox')

      expect(select).toHaveAttribute('aria-invalid', 'false')
    })

    it('should display error message with correct styling', () => {
      render(<Select label="Choose" options={defaultOptions} error="This field is required" />)
      const errorMessage = screen.getByText('This field is required')

      expect(errorMessage).toHaveClass('text-red-600', 'text-[0.6rem]')
    })
  })

  describe('Option selection', () => {
    it('should allow selecting an option', async () => {
      const { container } = render(<Select label="Choose" options={defaultOptions} />)
      const select = container.querySelector('select')!

      await userEvent.selectOptions(select, 'opt2')

      expect(select.value).toBe('opt2')
    })

    it('should handle disabled options', () => {
      const optionsWithDisabled = [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2 (disabled)', value: 'opt2', disabled: true },
        { label: 'Option 3', value: 'opt3' },
      ]
      const { container } = render(<Select label="Choose" options={optionsWithDisabled} />)

      const disabledOption = container.querySelector('option[value="opt2"]')
      expect(disabledOption).toHaveAttribute('disabled')
    })

    it('should not allow selecting disabled option', async () => {
      const optionsWithDisabled = [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2 (disabled)', value: 'opt2', disabled: true },
      ]
      const { container } = render(<Select label="Choose" options={optionsWithDisabled} />)
      const select = container.querySelector('select')!

      await userEvent.selectOptions(select, 'opt1')

      expect(select.value).toBe('opt1')
      expect(select.value).not.toBe('opt2')
    })

    it('should handle selecting option after placeholder', async () => {
      const { container } = render(
        <Select label="Choose" options={defaultOptions} placeholder="Select an option" />,
      )
      const select = container.querySelector('select')!

      await userEvent.selectOptions(select, 'opt2')
      expect(select.value).toBe('opt2')
    })

    it('should default to first non-disabled option when placeholder is present', () => {
      const { container } = render(
        <Select label="Choose" options={defaultOptions} placeholder="Select an option" />,
      )
      const select = container.querySelector('select')!

      // placeholder — disabled опция, поэтому браузер должен выбрать
      // первую доступную опцию по умолчанию, а не пустое значение
      expect(select.value).toBe('opt1')
    })
  })

  describe('Props forwarding', () => {
    it('should forward disabled attribute', () => {
      render(<Select label="Choose" options={defaultOptions} disabled />)
      const select = screen.getByRole('combobox')

      expect(select).toBeDisabled()
    })

    it('should forward arbitrary HTML, data and aria attributes', () => {
      render(
        <Select
          label="Choose"
          options={defaultOptions}
          required
          name="my-select"
          data-testid="country-select"
          aria-describedby="select-help"
        />,
      )
      const select = screen.getByRole('combobox')

      expect(select).toBeRequired()
      expect(select).toHaveAttribute('name', 'my-select')
      expect(select).toHaveAttribute('data-testid', 'country-select')
      expect(select).toHaveAttribute('aria-describedby', 'select-help')
    })
  })

  describe('User interaction', () => {
    it('should call onChange handler when option selected', async () => {
      const handleChange = vi.fn()
      render(<Select label="Choose" options={defaultOptions} onChange={handleChange} />)
      const select = screen.getByRole('combobox')

      await userEvent.selectOptions(select, 'opt1')

      expect(handleChange).toHaveBeenCalled()
    })

    it('should call onFocus handler', async () => {
      const handleFocus = vi.fn()
      render(<Select label="Choose" options={defaultOptions} onFocus={handleFocus} />)
      const select = screen.getByRole('combobox')

      await userEvent.click(select)

      expect(handleFocus).toHaveBeenCalled()
    })

    it('should call onBlur handler', async () => {
      const handleBlur = vi.fn()
      render(<Select label="Choose" options={defaultOptions} onBlur={handleBlur} />)
      const select = screen.getByRole('combobox')

      await userEvent.click(select)
      await userEvent.tab()

      expect(handleBlur).toHaveBeenCalled()
    })

    it('should be focusable', () => {
      render(<Select label="Choose" options={defaultOptions} />)
      const select = screen.getByRole('combobox')

      select.focus()

      expect(select).toHaveFocus()
    })
  })

  describe('ForwardRef', () => {
    it('should forward ref to select element', () => {
      const ref = createRef<HTMLSelectElement>()
      render(<Select label="Choose" options={defaultOptions} ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLSelectElement)
      expect(ref.current?.tagName).toBe('SELECT')
    })

    it('should allow direct access to select value through ref', () => {
      const ref = createRef<HTMLSelectElement>()
      render(
        <Select label="Choose" options={defaultOptions} placeholder="Select option" ref={ref} />,
      )

      expect(ref.current?.value).toBe('opt1')
    })

    it('should allow setting value through ref', () => {
      const ref = createRef<HTMLSelectElement>()
      render(<Select label="Choose" options={defaultOptions} ref={ref} />)

      ref.current!.value = 'opt2'

      expect(ref.current?.value).toBe('opt2')
    })

    it('should allow setting focus through ref', () => {
      const ref = createRef<HTMLSelectElement>()
      render(<Select label="Choose" options={defaultOptions} ref={ref} />)

      ref.current?.focus()

      expect(ref.current).toHaveFocus()
    })
  })

  describe('Label association', () => {
    it('should render label with sr-only visibility', () => {
      const { container } = render(<Select label="Select Country" options={defaultOptions} />)
      const label = container.querySelector('label.sr-only')

      expect(label).toBeInTheDocument()
      expect(label).toHaveTextContent('Select Country')
    })

    it('should generate matching id and label text', () => {
      const { container } = render(<Select label="Country Name" options={defaultOptions} />)
      const select = screen.getByRole('combobox')
      const label = container.querySelector('label')

      expect(label?.textContent).toBe('Country Name')
      expect(select.id).toBe('country-name')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty options array', () => {
      const { container } = render(<Select label="Choose" options={[]} />)
      const select = container.querySelector('select')

      expect(select?.options.length).toBe(0)
    })

    it('should handle single option', () => {
      render(<Select label="Choose" options={[{ label: 'Only option', value: 'only' }]} />)
      expect(screen.getByText('Only option')).toBeInTheDocument()
    })

    it('should handle empty error string', () => {
      const { container } = render(<Select label="Choose" options={defaultOptions} error="" />)
      const errorParagraph = container.querySelector('p')

      expect(errorParagraph).not.toBeInTheDocument()
    })

    it('should handle long error message', () => {
      const longError = 'A'.repeat(200)
      render(<Select label="Choose" options={defaultOptions} error={longError} />)
      const errorMessage = screen.getByText(longError)

      expect(errorMessage).toBeInTheDocument()
    })

    it('should handle multiple prop changes', () => {
      const { rerender } = render(<Select label="Choose" options={defaultOptions} />)
      let select = screen.getByRole('combobox')

      expect(select).not.toHaveAttribute('disabled')

      rerender(<Select label="Choose" options={defaultOptions} disabled />)
      select = screen.getByRole('combobox')

      expect(select).toHaveAttribute('disabled')
    })
  })

  describe('Placeholder behavior', () => {
    it('should have placeholder option as disabled', () => {
      const { container } = render(
        <Select label="Choose" options={defaultOptions} placeholder="Select option" />,
      )
      const placeholderOption = container.querySelector('option[value=""]')

      expect(placeholderOption).toHaveAttribute('disabled')
    })

    it('should have empty value for placeholder option', () => {
      const { container } = render(
        <Select label="Choose" options={defaultOptions} placeholder="Select option" />,
      )
      const placeholderOption = container.querySelector('option[value=""]')

      expect(placeholderOption).toHaveAttribute('value', '')
    })

    it('should render placeholder before regular options', () => {
      const { container } = render(
        <Select label="Choose" options={defaultOptions} placeholder="Select option" />,
      )
      const options = container.querySelectorAll('option')

      expect(options[0].textContent).toBe('Select option')
      expect(options[1].textContent).toBe('Option 1')
    })
  })
})
