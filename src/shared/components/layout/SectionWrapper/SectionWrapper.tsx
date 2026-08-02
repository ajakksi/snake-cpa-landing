import type { ReactNode } from 'react'
import { SectionTitle } from '@components/ui'

interface SectionWrapperProps {
  id: string
  eyebrow?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
}

function SectionWrapper({
  id,
  eyebrow,
  children,
  footer,
  className = '',
  contentClassName = '',
}: SectionWrapperProps) {
  const sectionClasses = [
    'relative lg:min-h-dvh w-full lg:h-dvh lg:min-h-0 lg:overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const containerClasses = [
    'fullpage-scrollbar flex lg:min-h-dvh w-full flex-col pt-[20px] pb-8 md:pt-[3vh] lg:h-dvh lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain',
    contentClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} data-fullpage-section className={sectionClasses}>
      <div data-fullpage-scroll className={containerClasses}>
        {eyebrow && (
          <SectionTitle className="container order-2 mt-auto mb-[20px] md:order-1 md:mt-0 md:mb-0">
            {eyebrow}
          </SectionTitle>
        )}
        <div className="order-1 min-h-0 flex-1 md:order-2">{children}</div>
      </div>
      {footer}
    </section>
  )
}

export default SectionWrapper
