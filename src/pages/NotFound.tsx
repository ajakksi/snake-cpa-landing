import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import snake404 from '@assets/images/snake-hero.png'
import snakeLogo from '@assets/icons/logo.svg'
import { PageBackground } from '@components/layout'
import { Button3DLink } from '@components/ui'
import { useLocale } from '@hooks/useLocale'
import MobileMenu from '@sections/hero/ui/header/mobile-menu/MobileMenu'

function NotFound() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t, i18n } = useTranslation('notFound')
  const locale = useLocale()
  const homePath = locale === 'en' ? '/' : `/${locale}`

  const changeLanguage = (language: 'en' | 'ru' | 'ua') => {
    void i18n.changeLanguage(language)
    document.documentElement.lang = language
  }

  return (
    <>
      <PageBackground />

      <main className="relative z-10 h-screen overflow-hidden text-white landscape:max-xl:overflow-y-auto landscape:max-xl:pb-12">
        <div className="container relative flex min-h-full flex-col">
          <header className="relative top-[18px] z-[3] flex items-center justify-between md:top-[30px]">
            <Link to={homePath} aria-label={t('homeLabel')}>
              <img
                src={snakeLogo}
                alt=""
                className="block h-[22px] w-[25px] md:h-[40px] md:w-[45px]"
                aria-hidden="true"
              />
            </Link>

            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-[16px] font-bold uppercase leading-none text-yellow underline underline-offset-2 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              Menu
            </button>
          </header>

          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            onLanguageChange={changeLanguage}
            homePath={homePath}
          />

          <div className="absolute inset-x-0 top-[103px] z-[3] flex flex-col items-center gap-5 md:top-1/2 md:-translate-y-[39%] md:gap-20">
            <h1
              className="m-0 flex flex-col items-center text-[clamp(132px,42.75vw,168px)] font-bold leading-[0.86] tracking-[-0.055em] md:flex-row md:text-[clamp(250px,24.3vw,350px)] md:leading-[0.72] md:tracking-[-0.065em]"
              aria-label={t('errorLabel')}
            >
              <span>4</span>
              <span>0</span>
              <span>4</span>
            </h1>

            <Button3DLink
              to={homePath}
              className="min-h-[61px] w-[min(252px,calc(100vw-64px))] text-center text-[18px] md:min-h-[84px] md:w-[420px] md:text-[22px]"
            >
              <span className="hidden md:inline">{t('desktopCta')}</span>
              <span className="md:hidden">{t('mobileCta')}</span>
            </Button3DLink>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={snake404}
            alt=""
            className="absolute -right-16 bottom-[-139px] h-auto w-[400px] max-w-none select-none md:bottom-[-25px] md:left-0 md:right-auto md:w-[clamp(390px,32vw,470px)] md:-scale-x-100"
          />
        </div>
      </main>
    </>
  )
}

export default NotFound