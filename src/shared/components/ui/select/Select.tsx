import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type SelectOption = {
  label: string
  value: string
  disabled?: boolean
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: readonly SelectOption[]
  placeholder?: string
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, placeholder, error, className = '', id, ...props },
  ref,
) {
  const selectId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-')
  const classes = [
    'w-full min-h-[2.3rem] appearance-none rounded-lg border bg-white px-4 py-2 pr-8 font-sans text-sm leading-none text-dark cursor-pointer outline-none transition-colors duration-200',
    'border-purple/30 focus:border-purple',
    error ? 'border-red-500 focus:border-red-500' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="relative">
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>

      <select ref={ref} id={selectId} className={classes} aria-invalid={Boolean(error)} {...props}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}

        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? <p className="px-1 mt-1 text-[0.6rem] leading-none text-red-600">{error}</p> : null}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-[1.15rem] -translate-y-1/2 text-purple"
      >
        ▼
      </span>
    </div>
  )
})

export default Select
