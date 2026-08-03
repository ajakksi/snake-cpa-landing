import { Link, type LinkProps } from 'react-router-dom'
import Button3DIcon from './Button3DIcon'
import styles from './Button3D.module.scss'

type Button3DLinkProps = LinkProps

function Button3DLink({ children, className = '', to, ...linkProps }: Button3DLinkProps) {
  const rootClasses = [styles.btn, className].filter(Boolean).join(' ')

  return (
    <Link to={to} className={rootClasses} {...linkProps}>
      <Button3DIcon
        className={styles.svg}
        fillClassName={styles.fill}
        strokeClassName={styles.stroke}
      />

      <span className={styles.text}>{children}</span>
    </Link>
  )
}

export default Button3DLink
