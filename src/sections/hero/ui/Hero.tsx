import { SectionWrapper } from '@components/layout/'
import { Button3D } from '@components/ui'
import { useTranslation } from 'react-i18next'
import snakeLogo from '@assets/icons/logo.svg'
import snakeHero from '@assets/images/snake-hero.png'
import styles from './Hero.module.scss'

type HeroProps = {
  onJoinClick: () => void
}

export default function Hero({ onJoinClick }: HeroProps) {
  const { t, i18n } = useTranslation('hero')
  const isEnglish = i18n.language.startsWith('en')

  return (
    <SectionWrapper id="hero">
      <div className="flex h-full min-h-0 flex-col">
        <div className="container relative flex flex-1 flex-col">
          <header className="flex justify-between items-center mb-[110px] md:mb-[148px]">
            <img
              src={snakeLogo}
              alt="Logo"
              className="w-[25px] h-[20px] md:w-[45px] md:h-[40px]"
              aria-hidden="true"
            />

            <div className="hidden md:flex items-center gap-[30px]">
              <nav className="flex gap-[30px]">
                <a
                  href="#team"
                  className="text-[20px] font-bold text-yellow underline uppercase hover:text-white hover:no-underline transition-colors"
                >
                  {t('nav.team')}
                </a>
                <a
                  href="#benefits"
                  className="text-[20px] font-bold text-yellow underline uppercase hover:text-white hover:no-underline transition-colors"
                >
                  {t('nav.benefits')}
                </a>
                <a
                  href="#join-us"
                  className="text-[20px] font-bold text-yellow underline uppercase hover:text-white hover:no-underline transition-colors"
                >
                  {t('nav.joinUs')}
                </a>
              </nav>

              <div className="flex gap-2 text-[20px] font-bold uppercase">
                <button
                  className={`transition-colors ${isEnglish ? 'text-white' : 'text-yellow hover:text-white'}`}
                >
                  ENG
                </button>
                <span className="text-white">/</span>
                <button
                  className={`transition-colors ${isEnglish ? 'text-yellow underline hover:text-white hover:no-underline' : 'text-white'}`}
                >
                  РУС
                </button>
              </div>
            </div>

            <button className="md:hidden text-yellow font-bold text-[16px] underline hover:text-white hover:no-underline transition-colors">
              MENU
            </button>
          </header>

          <div className="relative z-10 max-w-[758px]">
            <h1 className="text-[38px] md:text-[80px] font-bold leading-[0.9] text-white mb-3 md:mb-[12px] uppercase">
              <div>{t('title').split(' ')[0]}</div>
              <div>
                {t('title').split(' ')[1]}{' '}
                <span className="text-yellow">{t('title').split(' ')[2]}</span>
              </div>
            </h1>

            <p className="text-[20px] font-normal leading-[1.2] text-white max-w-[360px] md:max-w-[530px] mb-5 md:mb-[30px]">
              {t('description')}
            </p>

            <Button3D
              onClick={onJoinClick}
              className="w-[250px] min-h-[60px] md:w-[280px] md:min-h-[80px]"
            >
              {t('cta')}
            </Button3D>
          </div>

          <img
            className="pointer-events-none absolute z-[1] hidden select-none lg:block lg:w-auto lg:max-h-[calc(100vh-105px)] lg:top-[min(105px,10vh)] lg:right-0 lg:object-contain"
            src={snakeHero}
            alt=""
            aria-hidden="true"
          />

          <div className="absolute bottom-0 left-4 md:left-[50px] hidden md:flex gap-[35px] z-10">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" title="Instagram" className={styles.socialIcon}>
              <svg
                width="30"
                height="30"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className={styles.iconPath}
                  d="M14.4444 0C15.9179 0 17.3309 0.585316 18.3728 1.62718C19.4147 2.66905 20 4.08213 20 5.55556V14.4444C20 15.9179 19.4147 17.3309 18.3728 18.3728C17.3309 19.4147 15.9179 20 14.4444 20H5.55556C4.08213 20 2.66905 19.4147 1.62718 18.3728C0.585316 17.3309 0 15.9179 0 14.4444V5.55556C0 4.08213 0.585316 2.66905 1.62718 1.62718C2.66905 0.585316 4.08213 0 5.55556 0H14.4444ZM10 5.55556C8.82126 5.55556 7.6908 6.02381 6.8573 6.8573C6.02381 7.6908 5.55556 8.82126 5.55556 10C5.55556 11.1787 6.02381 12.3092 6.8573 13.1427C7.6908 13.9762 8.82126 14.4444 10 14.4444C11.1787 14.4444 12.3092 13.9762 13.1427 13.1427C13.9762 12.3092 14.4444 11.1787 14.4444 10C14.4444 8.82126 13.9762 7.6908 13.1427 6.8573C12.3092 6.02381 11.1787 5.55556 10 5.55556ZM10 7.77778C10.5894 7.77778 11.1546 8.0119 11.5713 8.42865C11.9881 8.8454 12.2222 9.41063 12.2222 10C12.2222 10.5894 11.9881 11.1546 11.5713 11.5713C11.1546 11.9881 10.5894 12.2222 10 12.2222C9.41063 12.2222 8.8454 11.9881 8.42865 11.5713C8.0119 11.1546 7.77778 10.5894 7.77778 10C7.77778 9.41063 8.0119 8.8454 8.42865 8.42865C8.8454 8.0119 9.41063 7.77778 10 7.77778ZM15 3.88889C14.7053 3.88889 14.4227 4.00595 14.2143 4.21433C14.006 4.4227 13.8889 4.70532 13.8889 5C13.8889 5.29469 14.006 5.5773 14.2143 5.78567C14.4227 5.99405 14.7053 6.11111 15 6.11111C15.2947 6.11111 15.5773 5.99405 15.7857 5.78567C15.9941 5.5773 16.1111 5.29469 16.1111 5C16.1111 4.70532 15.9941 4.4227 15.7857 4.21433C15.5773 4.00595 15.2947 3.88889 15 3.88889Z"
                />
              </svg>
            </a>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" title="Telegram" className={styles.socialIcon}>
              <svg
                width="30"
                height="27"
                viewBox="0 0 20 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className={styles.iconPath}
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16.9591 16.8199V16.8178L16.9772 16.7734L20 1.16177V1.11221C20 0.722947 19.8589 0.383249 19.5545 0.179843C19.2874 0.00121801 18.98 -0.0111721 18.7643 0.00534816C18.5635 0.0241117 18.3654 0.0656671 18.1736 0.12925C18.0918 0.156003 18.0111 0.186317 17.9317 0.220111L17.9186 0.225274L1.06613 6.99755L1.06109 6.99961C1.00946 7.01644 0.959233 7.0375 0.910907 7.0626C0.791119 7.11789 0.676138 7.18352 0.567204 7.25877C0.3505 7.41159 -0.0617412 7.7709 0.00780567 8.34085C0.0652574 8.81374 0.382754 9.11317 0.597442 9.26908C0.723878 9.36052 0.860174 9.43674 1.00364 9.49624L1.03589 9.51069L1.04597 9.51379L1.05302 9.51689L4.00221 10.5339C3.99146 10.7239 4.01061 10.9149 4.05966 11.107L5.53627 16.8467C5.61694 17.1596 5.79125 17.4387 6.03472 17.6449C6.27818 17.8511 6.57858 17.974 6.89372 17.9963C7.20886 18.0186 7.52292 17.9393 7.79177 17.7694C8.06063 17.5995 8.27079 17.3476 8.39273 17.0491L10.6989 14.5236L14.659 17.6335L14.7154 17.6583C15.0753 17.8193 15.4109 17.8699 15.7183 17.8276C16.0258 17.7842 16.2697 17.6521 16.4531 17.5024C16.6653 17.3262 16.8345 17.1017 16.947 16.8467L16.9551 16.8292L16.9581 16.823L16.9591 16.8199ZM5.52116 10.7125C5.5048 10.6489 5.50869 10.5815 5.53225 10.5202C5.55581 10.4589 5.59782 10.407 5.65219 10.3718L15.6518 3.86696C15.6518 3.86696 16.2404 3.50042 16.2193 3.86696C16.2193 3.86696 16.3241 3.93097 16.0086 4.23144C15.7103 4.51744 8.88158 11.2711 8.19014 11.9547C8.15261 11.9936 8.12584 12.0421 8.11253 12.0951L6.99777 16.4523L5.52116 10.7125Z"
                />
              </svg>
            </a>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" title="LinkedIn" className={styles.socialIcon}>
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className={styles.iconPath}
                  d="M26.6667 0C27.5507 0 28.3986 0.351189 29.0237 0.97631C29.6488 1.60143 30 2.44928 30 3.33333V26.6667C30 27.5507 29.6488 28.3986 29.0237 29.0237C28.3986 29.6488 27.5507 30 26.6667 30H3.33333C2.44928 30 1.60143 29.6488 0.97631 29.0237C0.351189 28.3986 0 27.5507 0 26.6667V3.33333C0 2.44928 0.351189 1.60143 0.97631 0.97631C1.60143 0.351189 2.44928 0 3.33333 0H26.6667ZM25.8333 25.8333V17C25.8333 15.559 25.2609 14.177 24.2419 13.1581C23.223 12.1391 21.841 11.5667 20.4 11.5667C18.9833 11.5667 17.3333 12.4333 16.5333 13.7333V11.8833H11.8833V25.8333H16.5333V17.6167C16.5333 16.3333 17.5667 15.2833 18.85 15.2833C19.4688 15.2833 20.0623 15.5292 20.4999 15.9667C20.9375 16.4043 21.1833 16.9978 21.1833 17.6167V25.8333H25.8333ZM6.46667 9.26667C7.20927 9.26667 7.92146 8.97167 8.44657 8.44657C8.97167 7.92146 9.26667 7.20927 9.26667 6.46667C9.26667 4.91667 8.01667 3.65 6.46667 3.65C5.71964 3.65 5.00321 3.94675 4.47498 4.47498C3.94675 5.00321 3.65 5.71964 3.65 6.46667C3.65 8.01667 4.91667 9.26667 6.46667 9.26667ZM8.78333 25.8333V11.8833H4.16667V25.8333H8.78333Z"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="md:hidden flex justify-center pb-8">
          <img
            src={snakeHero}
            alt=""
            aria-hidden="true"
            className="w-[435px] h-[448px] object-contain"
          />
        </div>
      </div>
    </SectionWrapper>
  )
}
