import type { HTMLAttributes } from 'react'
import styles from './PageBackground.module.scss'
import { useIsMobile } from '@hooks/useDeviceType'

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
  const isMobile = useIsMobile()

  const bgClass = isMobile ? 'bg-mobile-bg' : gradientClasses.main

  return (
    <div
      className={`${styles.background} ${bgClass} ${className}`}
      aria-hidden="true"
      {...backgroundProps}
    >
      {!isMobile && <div className={styles.gridLayer} />}
      {!isMobile && <div className={`${styles.maskLayer} ${gradientClasses.main}`} />}

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