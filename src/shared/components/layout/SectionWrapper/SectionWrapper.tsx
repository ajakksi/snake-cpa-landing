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
  const sectionClasses = ['min-h-dvh w-full md:h-dvh', className].filter(Boolean).join(' ')

  const containerClasses = [
    'flex min-h-dvh w-full flex-col pb-8 md:h-full md:min-h-0 md:pt-[3vh]',
    contentClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={sectionClasses}>
      <div className={containerClasses}>
        {eyebrow && (
          <SectionTitle className="container order-2 mt-auto mb-[50px] md:order-1 md:mt-0 md:mb-0">
            {eyebrow}
          </SectionTitle>
        )}
        <div className="order-1 min-h-0 flex-1 md:order-2">{children}</div>
      </div>
    </section>
  )
}

export default SectionWrapper
