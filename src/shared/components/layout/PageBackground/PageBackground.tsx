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
      className={`${styles.background} ${gradientClasses.main} ${className}`}
      aria-hidden="true"
      {...backgroundProps}
    >
      <div className={styles.gridLayer} />
      <div className={`${styles.maskLayer} ${gradientClasses.main}`} />

      <div
        className={`${styles.darkVariant} ${
          variant === 'dark' ? styles.darkVariantVisible : ''
        } ${gradientClasses.dark}`}
      >
        <div className={styles.gridLayer} />
        <div className={`${styles.maskLayer} ${gradientClasses.dark}`} />
      </div>
    </div>
  )
}

export default PageBackground
