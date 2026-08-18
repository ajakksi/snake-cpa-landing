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

const MOBILE_PROPS = { 'data-mobile': true } as const
const EMPTY_PROPS = {} as const

function PageBackground({
  variant = 'main',
  className = '',
  ...backgroundProps
}: PageBackgroundProps) {
  const isMobile = useIsMobile()

  const bgClass = isMobile ? styles.backgroundMobile : gradientClasses.main
  const mobileProps = isMobile ? MOBILE_PROPS : EMPTY_PROPS
  const maskLayerClassName = !isMobile
    ? `${styles.maskLayer} ${gradientClasses.main}`
    : styles.maskLayer

  return (
    <div
      className={`${styles.background} ${bgClass} ${className}`}
      aria-hidden="true"
      {...backgroundProps}
    >
      <div className={styles.gridLayer} {...mobileProps} />
      <div className={maskLayerClassName} {...mobileProps} />

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
