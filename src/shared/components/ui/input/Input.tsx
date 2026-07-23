import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', id, ...props },
  ref,
) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-')
  const classes = [
    'w-full min-h-[2.3rem] rounded-lg border bg-white px-4 py-2 font-sans text-sm leading-none text-dark outline-none transition-colors duration-200',
    'border-purple/30 placeholder:text-dark focus:border-purple',
    error ? 'border-red-500 focus:border-red-500' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <label htmlFor={inputId} className="sr-only">
        {}
      </label>

      <input ref={ref} id={inputId} className={classes} aria-invalid={Boolean(error)} {...props} />

      {error ? <p className="px-1 mt-1 text-[0.6rem] leading-none text-red-600">{error}</p> : null}
    </div>
  )
})

export default Input
