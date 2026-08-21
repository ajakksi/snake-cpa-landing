import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getBenefits } from '@api/endpoints/benefits'
import { getApiErrorMessage, isRetryableApiError } from '@api/endpoints/errors'
import snakeBenefits from '@assets/images/snake-benefits.png'
import { SectionWrapper } from '@components/layout'
import { Button } from '@components/ui'
import { useLocale } from '@hooks/useLocale'
import { useMultiBenefitsAnimation } from '../hooks/useMultiBenefitsAnimation'
import DreamBigMarquee from './DreamBigMarquee/DreamBigMarquee'

// Подстраховка на первый рендер (до JS). На мобилке (<1024px) не применяется.
// Значения должны совпадать с TEXT_OFFSET_X / RIGHT_OFFSET_X в benefitsAnimation.ts.
const TEXT_HIDDEN_CLASS = 'lg:opacity-0 lg:-translate-x-[70px]'
const RIGHT_HIDDEN_CLASS = 'lg:opacity-0 lg:translate-x-[90px]'

type MultiBenefitsProps = {
  playTrigger: number
  resetTrigger: number
}

export default function MultiBenefits({ playTrigger, resetTrigger }: MultiBenefitsProps) {
  const { t } = useTranslation('common')
  const locale = useLocale()
  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: ['benefits', locale],
    queryFn: () => getBenefits(locale),
  })

  const textBlockRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useMultiBenefitsAnimation(
    { textBlockRef, imageRef, listRef },
    { playTrigger, resetTrigger, isPending },
  )

  return (
    <SectionWrapper id="benefits" eyebrow="Multi-benefits" className="relative text-white">
      <div className="flex h-full min-h-0 flex-col">
        <div className="container relative flex flex-1 flex-col pb-12 pt-16 md:pb-6 md:pt-12 xl:flex-row">
          <div ref={textBlockRef} className={`relative z-10 max-w-[650px] ${TEXT_HIDDEN_CLASS}`}>
            {isPending || data?.title ? (
              <h3 className="text-[32px] font-bold leading-[0.9] md:text-[46px] md:leading-[1.08] lg:text-[50px] lg:leading-[50px]">
                {isPending ? t('loading') : data?.title}
              </h3>
            ) : null}

            {error || isPending || data?.description ? (
              <p className="mt-5 w-full max-w-[590px] text-[17px] font-medium leading-[1.16] md:mt-5 md:text-[20px] md:leading-[1.2] xl:w-[75%]">
                {error ? getApiErrorMessage(error) : isPending ? t('loading') : data?.description}
              </p>
            ) : null}
            {error && isRetryableApiError(error) ? (
              <Button
                type="button"
                className="mt-5"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                {t('retry')}
              </Button>
            ) : null}
          </div>

          <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 xl:hidden">
            <DreamBigMarquee />
          </div>

          <img
            ref={imageRef}
            className={`pointer-events-none absolute z-[1] hidden select-none lg:bottom-0 lg:right-[620px] lg:block lg:w-[314px] xl:left-[31%] xl:top-[min(25.556vh,230px)] xl:h-[min(27.083vw,390px)] xl:w-[min(27.083vw,390px)] ${RIGHT_HIDDEN_CLASS}`}
            src={snakeBenefits}
            alt=""
            aria-hidden="true"
          />

          <ul
            ref={listRef}
            className={`relative z-10 mt-12 flex w-full flex-col gap-5 md:ml-auto md:max-w-[570px] xl:mt-[min(19.556vh,176px)] xl:w-[42%] xl:gap-4 ${RIGHT_HIDDEN_CLASS}`}
          >
            {!isPending &&
              data?.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="rounded-[8px] bg-purple hover:bg-yellow hover:text-ink px-4 py-4 text-[19px] font-bold leading-[1.2] transition-colors duration-300 md:px-4 md:py-4 md:text-[20px]"
                >
                  {benefit}
                </li>
              ))}
          </ul>
        </div>

        <div className="mb-10 mt-auto hidden xl:block">
          <DreamBigMarquee />
        </div>
      </div>
    </SectionWrapper>
  )
}
