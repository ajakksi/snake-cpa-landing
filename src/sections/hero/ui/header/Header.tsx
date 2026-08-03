import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import snakeLogo from '@assets/icons/logo.svg'
import styles from './Header.module.scss'
import MobileMenu from './mobile-menu/MobileMenu'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t, i18n } = useTranslation('hero')
  const isEnglish = i18n.language.startsWith('en')

  return (
    <header className={styles.header}>
      <img
        src={snakeLogo}
        alt="Logo"
        className={styles.logo}
        aria-hidden="true"
      />

      <div className={styles.desktopNav}>
        <nav className={styles.nav}>
          <a href="#team" className={styles.navLink}>
            {t('nav.team')}
          </a>
          <a href="#benefits" className={styles.navLink}>
            {t('nav.benefits')}
          </a>
          <a href="#join-us" className={styles.navLink}>
            {t('nav.joinUs')}
          </a>
        </nav>

        <div className={styles.languageSwitcher}>
          <button
            type="button"
            className={`${styles.langButton} ${isEnglish ? styles.active : ''}`}
          >
            ENG
          </button>
          <span className={styles.separator}>/</span>
          <button
            type="button"
            className={`${styles.langButton} ${!isEnglish ? styles.active : ''}`}
          >
            РУС
          </button>
        </div>
      </div>

      <button type="button" className={styles.menuButton} onClick={() => setIsMobileMenuOpen(true)}>
        MENU
      </button>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  )
}
