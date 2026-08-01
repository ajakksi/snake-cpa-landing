import { useTranslation } from 'react-i18next'
import ArrowIcon from '@assets/icons/arrow.svg?react'
import { socialLinks } from '@data/socialLinks'

export default function Footer() {
  const { t } = useTranslation('common')

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="hidden md:block absolute inset-x-0 bottom-0 z-30">
      <div className="container flex justify-end">
        <div className="flex min-h-20 w-full flex-col items-center justify-center gap-4 text-[20px] font-bold uppercase leading-none tracking-[0.08em] text-yellow sm:flex-row sm:items-baseline sm:justify-between xl:max-w-[800px]">
          <nav
            aria-label={t('footer.socialsLabel')}
            className="flex flex-wrap items-baseline justify-center gap-x-1 gap-y-2 sm:gap-x-3 md:gap-x-5"
          >
            {socialLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
              >
                <span className="underline">{label}</span>
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex min-h-11 items-baseline gap-2 px-2 uppercase transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
          >
            <span className="underline">{t('footer.backToTop')}</span>
            <ArrowIcon aria-hidden="true" className="h-[31px] w-[15px] shrink-0" />
          </button>
        </div>
      </div>
    </footer>
  )
}
