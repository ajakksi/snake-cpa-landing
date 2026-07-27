import type { HTMLAttributes } from 'react'
import styles from './PageBackground.module.scss'

type PageBackgroundVariant = 'main' | 'dark'

type PageBackgroundProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  variant?: PageBackgroundVariant
}

const gradientClasses: Record<PageBackgroundVariant, string> = {
  main: 'bg-gradient-main',
  dark: 'bg-gradient-tasks',
}

function PageBackground({
  variant = 'main',
  className = '',
  ...backgroundProps
}: PageBackgroundProps) {
  return (
    <div
      className={`${styles.background} ${gradientClasses[variant]} ${className}`}
      aria-hidden="true"
      {...backgroundProps}
    >
      <div className={styles.gridLayer} />
      <div className={`${styles.maskLayer} ${gradientClasses[variant]}`} />
    </div>
  )
}

export default PageBackground
