import { useRef } from 'react'
import { SectionWrapper } from '@components/layout/'
import { Button3D } from '@components/ui'
import { useTranslation } from 'react-i18next'
import { useHeroAnimation } from '../hooks/useHeroAnimation'
import AnimatedWord from './AnimatedWord'
import snakeHero from '@assets/images/snake-hero.png'
import Header from './header/Header'
import SocialLinks from './social-links/SocialLinks'


const HIDDEN_CLASS = 'lg:opacity-0 lg:-translate-x-[70px]'

type HeroProps = {
  onJoinClick: () => void
  playTrigger: number
  resetTrigger: number
  exitTrigger: number
}

export default function Hero({ onJoinClick, playTrigger, resetTrigger, exitTrigger }: HeroProps) {
  const { t } = useTranslation('hero')

  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useHeroAnimation(
    { titleRef, descriptionRef, ctaRef, imageRef },
    { playTrigger, resetTrigger, exitTrigger },
  )

  return (
    <SectionWrapper id="hero" footer={<SocialLinks />}>
      <div className="container relative flex h-full min-h-0 flex-col">
        <Header />

<div className="relative z-10 max-w-[758px] pt-[110px] md:pt-0">
          <h1
            ref={titleRef}
            className={`text-[38px] md:text-[80px] font-bold leading-[0.9] tracking-[-0.83px] md:tracking-[-1.74px] text-white mb-3 md:mb-[12px] uppercase ${HIDDEN_CLASS}`}
          >
            <div>{t('title.word1')}</div>
            <div className="flex flex-nowrap items-end gap-x-3 whitespace-nowrap">
              <span>{t('title.word2')}</span>
              <AnimatedWord />
            </div>
          </h1>

          <p
            ref={descriptionRef}
            className={`text-[20px] font-normal leading-[1.2] text-white max-w-[360px] md:max-w-[530px] mb-5 md:mb-[30px] ${HIDDEN_CLASS}`}
          >
            {t('description')}
          </p>

          <div ref={ctaRef} className={`inline-block ${HIDDEN_CLASS}`}>
            <Button3D
              onClick={onJoinClick}
              className="w-[250px] min-h-[60px] md:w-[280px] md:min-h-[80px]"
            >
              {t('cta')}
            </Button3D>
          </div>
        </div>

        <img
          ref={imageRef}
          className="pointer-events-none absolute z-[1] hidden select-none lg:block lg:w-auto lg:max-h-[calc(100vh-105px)] lg:top-[min(105px,10vh)] lg:right-0 lg:object-contain"
          src={snakeHero}
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="md:hidden flex justify-center pb-8">
        <img
          src={snakeHero}
          alt=""
          aria-hidden="true"
          className="w-[435px] h-[448px] object-contain"
        />
      </div>
    </SectionWrapper>
  )
}