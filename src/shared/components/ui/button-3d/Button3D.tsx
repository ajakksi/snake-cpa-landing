import type { ButtonHTMLAttributes } from 'react'
import Button3DIcon from './Button3DIcon'
import styles from './Button3D.module.scss'

type Button3DProps = ButtonHTMLAttributes<HTMLButtonElement>

function Button3D({ children, className = '', type = 'button', ...buttonProps }: Button3DProps) {
  const rootClasses = [styles.btn, className].filter(Boolean).join(' ')

  return (
    <button type={type} className={rootClasses} {...buttonProps}>
      <Button3DIcon
        className={styles.svg}
        fillClassName={styles.fill}
        strokeClassName={styles.stroke}
      />

      <span className={styles.text}>{children}</span>
    </button>
  )
}

export default Button3D
