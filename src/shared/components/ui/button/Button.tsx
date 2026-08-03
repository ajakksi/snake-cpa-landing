import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

function Button({ children, className = '', type = 'submit', ...props }: ButtonProps) {
  const classes = [
    'inline-flex min-h-[2.2rem] items-center justify-center rounded-[0.45rem] px-[1.25rem] py-[0.55rem]',
    'font-sans text-[0.75rem] font-bold leading-none transition-opacity duration-200 hover:opacity-95',
    'bg-yellow text-ink hover:bg-purple hover:text-white',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
