import type { ReactNode } from 'react'
import { SectionTitle } from '@components/ui'

interface SectionWrapperProps {
  id: string
  eyebrow?: string
  children: ReactNode
  className?: string
  contentClassName?: string
}

function SectionWrapper({
  id,
  eyebrow,
  children,
  className = '',
  contentClassName = '',
}: SectionWrapperProps) {
  const sectionClasses = ['h-dvh w-full', className].filter(Boolean).join(' ')

  const containerClasses = [
    'mx-auto flex h-full w-full max-w-[1440px] flex-col px-4 pb-8 md:px-[50px] md:pt-[60px]',
    contentClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={sectionClasses}>
      <div className={containerClasses}>
        {eyebrow && (
          <SectionTitle className="order-2 mt-auto md:order-1 md:mt-0">{eyebrow}</SectionTitle>
        )}
        <div className="order-1 flex-1 md:order-2">{children}</div>
      </div>
    </section>
  )
}

export default SectionWrapper
