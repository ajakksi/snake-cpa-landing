import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import snakeLogo from '@assets/icons/logo.svg'
import styles from './Header.module.scss'
import MobileMenu from './mobile-menu/MobileMenu'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t, i18n } = useTranslation('hero')
  const location = useLocation()
  const navigate = useNavigate()
  const isEnglish = (i18n.resolvedLanguage ?? i18n.language).startsWith('en')

  const changeLanguage = (language: 'en' | 'ru') => {
    void i18n.changeLanguage(language)
    void navigate({
      pathname: language === 'en' ? '/' : `/${language}`,
      search: location.search,
      hash: location.hash,
    })
  }

  return (
    <header className={styles.header}>
      <img src={snakeLogo} alt="Logo" className={styles.logo} aria-hidden="true" />

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
            lang="en"
            aria-label="Switch to English"
            aria-pressed={isEnglish}
            onClick={() => changeLanguage('en')}
            className={`${styles.langButton} ${isEnglish ? styles.active : ''}`}
          >
            ENG
          </button>
          <span className={styles.separator}>/</span>
          <button
            type="button"
            lang="ru"
            aria-label="Переключить на русский"
            aria-pressed={!isEnglish}
            onClick={() => changeLanguage('ru')}
            className={`${styles.langButton} ${!isEnglish ? styles.active : ''}`}
          >
            РУС
          </button>
        </div>
      </div>

      <button type="button" className={styles.menuButton} onClick={() => setIsMobileMenuOpen(true)}>
        MENU
      </button>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLanguageChange={changeLanguage}
      />
    </header>
  )
}
