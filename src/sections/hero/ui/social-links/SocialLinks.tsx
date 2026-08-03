import styles from './SocialLinks.module.scss'
import InstagramIcon from '@assets/icons/instagram.svg?react'
import TelegramIcon from '@assets/icons/telegram.svg?react'
import LinkedinIcon from '@assets/icons/linkedin.svg?react'

export default function SocialLinks() {
  return (
    <div className={styles.container}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a href="#" title="Instagram" className={styles.link}>
        <InstagramIcon />
      </a>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a href="#" title="Telegram" className={styles.link}>
        <TelegramIcon />
      </a>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a href="#" title="LinkedIn" className={styles.link}>
        <LinkedinIcon />
      </a>
    </div>
  )
}
