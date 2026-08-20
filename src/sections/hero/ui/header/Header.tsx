import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import snakeLogo from '@assets/icons/logo.svg'
import { useLocale } from '@hooks/useLocale'
import styles from './Header.module.scss'
import MobileMenu from './mobile-menu/MobileMenu'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t, i18n } = useTranslation('hero')
  const location = useLocation()
  const navigate = useNavigate()
  const locale = useLocale()

  const changeLanguage = (language: 'en' | 'ru' | 'ua') => {
    void i18n.changeLanguage(language)
    void navigate({
      pathname: language === 'en' ? '/' : `/${language}`,
      search: location.search,
      hash: location.hash,
    })
  }

  const isLanguageActive = (language: 'en' | 'ru' | 'ua') => locale === language

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
            aria-pressed={isLanguageActive('en')}
            onClick={() => changeLanguage('en')}
            className={`${styles.langButton} ${isLanguageActive('en') ? styles.active : ''}`}
          >
            ENG
          </button>
          <span className={styles.separator}>/</span>
          <button
            type="button"
            lang="ru"
            aria-label="Переключить на русский"
            aria-pressed={isLanguageActive('ru')}
            onClick={() => changeLanguage('ru')}
            className={`${styles.langButton} ${isLanguageActive('ru') ? styles.active : ''}`}
          >
            РУС
          </button>
          <span className={styles.separator}>/</span>
          <button
            type="button"
            lang="uk"
            aria-label="Перейти на українську"
            aria-pressed={isLanguageActive('ua')}
            onClick={() => changeLanguage('ua')}
            className={`${styles.langButton} ${isLanguageActive('ua') ? styles.active : ''}`}
          >
            УКР
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
