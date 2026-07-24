import type { HTMLAttributes, ReactNode } from 'react'

type SectionTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode
}

function SectionTitle({ children, className = '', ...titleProps }: SectionTitleProps) {
  return (
    <h2
      className={`text-center text-xl font-bold uppercase leading-none text-yellow md:text-right md:text-2xl ${className}`}
      {...titleProps}
    >
      {children}
    </h2>
  )
}

export default SectionTitle
