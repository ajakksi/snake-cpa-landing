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
  it('should render a combobox with a visually-hidden, associated label', () => {
    render(<Select label="Country" options={defaultOptions} />)
    const select = screen.getByRole('combobox')
    const label = screen.getByText('Country')

    expect(select).toBeInTheDocument()
    expect(label).toHaveClass('sr-only')
    expect(label.getAttribute('for')).toBe(select.id)
  })

  it('should render every option', () => {
    render(<Select label="Choose" options={defaultOptions} />)
    defaultOptions.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('should render the placeholder as a disabled, empty-value option before the rest', () => {
    const { container } = render(
      <Select label="Choose" options={defaultOptions} placeholder="Select an option" />,
    )
    const options = container.querySelectorAll('option')

    expect(options[0]).toHaveTextContent('Select an option')
    expect(options[0]).toHaveAttribute('value', '')
    expect(options[0]).toHaveAttribute('disabled')
  })

  it('should hide the decorative arrow indicator from assistive tech', () => {
    const { container } = render(<Select label="Choose" options={defaultOptions} />)
    const arrow = container.querySelector('span[aria-hidden="true"]')

    expect(arrow).toHaveTextContent('▼')
  })

  it('should render an error message only when one is provided', () => {
    const { rerender, container } = render(<Select label="Choose" options={defaultOptions} />)
    expect(container.querySelector('p')).not.toBeInTheDocument()

    rerender(<Select label="Choose" options={defaultOptions} error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it.each([
    { props: { id: 'custom-id', name: 'country-select' }, expectedId: 'custom-id' },
    { props: { name: 'country-select' }, expectedId: 'country-select' },
    { props: {}, expectedId: 'country-selection' },
  ])('should generate the select id as "$expectedId" given $props', ({ props, expectedId }) => {
    render(<Select label="Country Selection" options={defaultOptions} {...props} />)
    expect(screen.getByRole('combobox')).toHaveAttribute('id', expectedId)
  })

  it.each([
    ['Invalid selection', 'true'],
    [undefined, 'false'],
    ['', 'false'],
  ])('should set aria-invalid to %s when error is %j', (error, expected) => {
    render(<Select label="Choose" options={defaultOptions} error={error} />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', expected)
  })

  it('should merge a custom className with the default styling', () => {
    render(<Select label="Choose" options={defaultOptions} className="custom-class" />)
    expect(screen.getByRole('combobox')).toHaveClass('custom-class')
  })

  it('should forward arbitrary HTML, data, and aria attributes', () => {
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
    expect(select).toHaveAttribute('data-testid', 'country-select')
    expect(select).toHaveAttribute('aria-describedby', 'select-help')
  })

  it('should forward the disabled attribute', () => {
    render(<Select label="Choose" options={defaultOptions} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('should mark individual options as disabled', () => {
    const optionsWithDisabled = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2 (disabled)', value: 'opt2', disabled: true },
    ]
    const { container } = render(<Select label="Choose" options={optionsWithDisabled} />)

    expect(container.querySelector('option[value="opt2"]')).toHaveAttribute('disabled')
  })

  it('should allow selecting an option and call onChange', async () => {
    const handleChange = vi.fn()
    const { container } = render(<Select label="Choose" options={defaultOptions} onChange={handleChange} />)
    const select = container.querySelector('select')!

    await userEvent.selectOptions(select, 'opt2')

    expect(select.value).toBe('opt2')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should default to the first non-disabled option when a placeholder is present', () => {
    const { container } = render(
      <Select label="Choose" options={defaultOptions} placeholder="Select an option" />,
    )
    const select = container.querySelector('select')!

    expect(select.value).toBe('opt1')
  })

  it('should forward ref to the underlying select element', () => {
    const ref = createRef<HTMLSelectElement>()
    render(<Select label="Choose" options={defaultOptions} ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
    expect(ref.current?.tagName).toBe('SELECT')
  })

  it('should handle an empty options array without crashing', () => {
    const { container } = render(<Select label="Choose" options={[]} />)
    expect(container.querySelector('select')?.options.length).toBe(0)
  })
})
