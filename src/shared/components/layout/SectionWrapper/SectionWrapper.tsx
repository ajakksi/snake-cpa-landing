import type { ReactNode } from 'react'

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
  const classes = ['h-dvh w-full relative', className].filter(Boolean).join(' ')

  return (
    <section id={id} className={classes}>
      {eyebrow && (
        <div className="absolute top-[60px] right-[50px] text-[40px] font-bold text-yellow uppercase tracking-[-1.74px] leading-[90%] z-10">
          {eyebrow}
        </div>
      )}

      <div
        className={['max-w-[1440px] mx-auto relative z-10', contentClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </section>
  )
}

export default SectionWrapper
