import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import snakeLogo from '@assets/icons/logo.svg'
import styles from './MobileMenu.module.scss'
import InstagramIcon from '@assets/icons/instagram.svg?react'
import TelegramIcon from '@assets/icons/telegram.svg?react'
import LinkedinIcon from '@assets/icons/linkedin.svg?react'

type MobileMenuProps = {
  isOpen: boolean
  onClose: () => void
  onLanguageChange: (language: 'en' | 'ru' | 'ua') => void
}

export default function MobileMenu({ isOpen, onClose, onLanguageChange }: MobileMenuProps) {
  const { t, i18n } = useTranslation('hero')
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language

  const isLanguageActive = (language: string) => currentLanguage.startsWith(language)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} role="presentation" />
      <div className={styles.menu}>
        <header className={styles.header}>
          <img src={snakeLogo} alt="Logo" className={styles.logo} aria-hidden="true" />
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </header>

        <nav className={styles.nav}>
          <a href="#hero" className={styles.link} onClick={onClose}>
            {t('nav.hero') || 'MAIN'}
          </a>
          <a href="#team" className={styles.link} onClick={onClose}>
            {t('nav.team')}
          </a>
          <a href="#benefits" className={styles.link} onClick={onClose}>
            {t('nav.benefits')}
          </a>
          <a href="#join-us" className={styles.link} onClick={onClose}>
            {t('nav.joinUs')}
          </a>
        </nav>

        <div className={styles.socialLinks}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            title="Instagram"
            className={styles.socialLink}
            onClick={(e) => e.preventDefault()}
          >
            <InstagramIcon />
          </a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            title="Telegram"
            className={styles.socialLink}
            onClick={(e) => e.preventDefault()}
          >
            <TelegramIcon />
          </a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            title="LinkedIn"
            className={styles.socialLink}
            onClick={(e) => e.preventDefault()}
          >
            <LinkedinIcon />
          </a>
        </div>

        <div className={styles.languageSwitcher}>
          <button
            type="button"
            aria-pressed={isLanguageActive('en')}
            onClick={() => {
              onLanguageChange('en')
              onClose()
            }}
            className={`${styles.langButton} ${isLanguageActive('en') ? styles.active : ''}`}
          >
            ENG
          </button>
          <span className={styles.separator}>/</span>
          <button
            type="button"
            aria-pressed={isLanguageActive('ru')}
            onClick={() => {
              onLanguageChange('ru')
              onClose()
            }}
            className={`${styles.langButton} ${isLanguageActive('ru') ? styles.active : ''}`}
          >
            РУС
          </button>
          <span className={styles.separator}>/</span>
          <button
            type="button"
            aria-pressed={isLanguageActive('ua')}
            onClick={() => {
              onLanguageChange('ua')
              onClose()
            }}
            className={`${styles.langButton} ${isLanguageActive('ua') ? styles.active : ''}`}
          >
            УКР
          </button>
        </div>
      </div>
    </>
  )
}
