import { useRef, useState, type KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getMultiply } from '@api/endpoints/multiply'
import { getApiErrorMessage, isRetryableApiError } from '@api/errors'
import ArrowIcon from '@assets/icons/arrow.svg?react'
import snakeWithUs from '@assets/images/snake-with-us.avif'
import { SectionWrapper } from '@components/layout'
import { Button3D } from '@components/ui'
import { useLocale } from '@hooks/useLocale'
import { tabKeys } from '../data/tabKeys'
import { resolveTabKey } from '../utils/resolveTabKey'
import { useJoinUsAnimation } from '../hooks/useJoinUsAnimation'

// Подстраховка на первый рендер (до JS). На мобилке (<1024px) не применяется.
const HIDDEN_CLASS = 'lg:opacity-0'

type JoinUsProps = {
  onJoinClick: () => void
  playTrigger: number
  resetTrigger: number
}

export default function JoinUs({ onJoinClick, playTrigger, resetTrigger }: JoinUsProps) {
  const { t } = useTranslation(['joinUs', 'common'])
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState(0)

  // Fetch localized content for the tabs.
  const {
    data = [],
    error,
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['multiply', locale],
    queryFn: () => getMultiply(locale),
  })

  const tabsRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const panelRef = useRef<HTMLDivElement>(null)

  useJoinUsAnimation({ tabsRef, panelRef }, { playTrigger, resetTrigger, isPending })

  // Keep the selected index valid if the API response changes.
  const safeActiveTab = activeTab < data.length || data.length === 0 ? activeTab : 0
  const activeItem = data[safeActiveTab]
  const tabItems = data.length ? data : tabKeys

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (index + 1) % tabItems.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (index - 1 + tabItems.length) % tabItems.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = tabItems.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    setActiveTab(nextIndex)
    tabButtonRefs.current[nextIndex]?.focus()
  }

  return (
    <SectionWrapper id="join-us" eyebrow="MULTIPLY WITH US" className="relative text-white">
      <div className="flex h-full min-h-0 flex-col">
        <div className="container relative flex flex-1 flex-col pt-8 md:pt-12">
          <div className="relative grid flex-1 content-between gap-8 pb-[50px] md:pb-[100px] lg:grid-cols-[minmax(400px,0.9fr)_minmax(0,1.3fr)] lg:items-start lg:gap-12 lg:pb-16 xl:grid-cols-[520px_minmax(0,720px)] xl:justify-between xl:gap-14">
            {/* Tab controls */}
            <div
              ref={tabsRef}
              className={`relative z-20 flex flex-col items-center gap-4 lg:items-stretch ${HIDDEN_CLASS}`}
              role="tablist"
              aria-label={t('tabsLabel')}
              aria-orientation="vertical"
            >
              {tabItems.map((item, index) => {
                const apiTitle = typeof item === 'string' ? item : item.title
                const tabKey = resolveTabKey(apiTitle)
                const isActive = index === safeActiveTab

                return (
                  <button
                    ref={(element) => {
                      tabButtonRefs.current[index] = element
                    }}
                    key={tabKey ?? apiTitle}
                    id={`join-us-tab-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="join-us-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(index)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    className={`flex min-h-14 items-center justify-between gap-6 md:gap-12 lg:gap-2 rounded-full border-2 px-6 text-left text-[20px] font-bold transition-[width,color,background-color,border-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow md:min-h-16 md:px-8 md:text-2xl ${
                      isActive
                        ? 'w-auto border-ink bg-yellow text-ink lg:w-full'
                        : 'w-auto border-yellow bg-transparent text-yellow hover:bg-yellow/10 lg:w-[92%]'
                    }`}
                  >
                    <span>{tabKey ? t(`tabs.${tabKey}`) : apiTitle}</span>
                    <span aria-hidden="true" className="relative h-[15px] w-[31px] shrink-0">
                      <ArrowIcon className="absolute left-1/2 top-1/2 h-[31px] w-[15px] -translate-x-1/2 -translate-y-1/2 rotate-90" />
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Active tab content */}
            <div
              ref={panelRef}
              id="join-us-panel"
              role="tabpanel"
              aria-labelledby={`join-us-tab-${safeActiveTab}`}
              className={`relative z-20 flex min-h-[360px] w-full min-w-0 flex-col items-center justify-center rounded-xl bg-purple px-6 py-8 text-center md:min-h-[410px] md:px-8 lg:h-[490px] ${HIDDEN_CLASS}`}
            >
              {error ? (
                <div className="flex flex-col items-center gap-5">
                  <p className="text-[18px] font-medium">{getApiErrorMessage(error)}</p>
                  {isRetryableApiError(error) ? (
                    <Button3D
                      type="button"
                      className="min-h-[58px] min-w-[230px]"
                      disabled={isFetching}
                      onClick={() => void refetch()}
                    >
                      {t('retry', { ns: 'common' })}
                    </Button3D>
                  ) : null}
                </div>
              ) : isPending ? (
                <p className="text-[18px] font-medium">{t('loading', { ns: 'common' })}</p>
              ) : (
                <>
                  <p className="max-w-[570px] text-[17px] font-medium leading-[1.25] md:text-[20px]">
                    {activeItem?.steps.step_1}
                  </p>
                  <ArrowIcon
                    aria-hidden="true"
                    className="mt-4 h-[31px] w-[15px] text-dark shrink-0 rotate-180"
                  />
                  <p className="mt-7 max-w-[570px] text-[17px] font-medium leading-[1.25] md:text-[20px]">
                    {activeItem?.steps.step_2}
                  </p>
                  <ArrowIcon
                    aria-hidden="true"
                    className="mt-4 h-[31px] w-[15px] text-dark shrink-0 rotate-180"
                  />
                  <Button3D
                    onClick={onJoinClick}
                    className="mt-5 min-h-[58px] min-w-[230px] max-w-full md:min-h-[66px] md:min-w-[270px]"
                  >
                    {t(`cta.${resolveTabKey(activeItem?.title) ?? tabKeys[safeActiveTab]}`)}
                  </Button3D>
                </>
              )}
            </div>
          </div>

          {/* Anchored to the section container so tab content cannot shift it.
              Не анимируется — статична, как и на видео. */}
          <img
            src={snakeWithUs}
            alt=""
            loading="lazy"
            decoding="async"
            aria-hidden="true"
            className="hidden lg:block pointer-events-none absolute -bottom-4 -left-0 z-10 w-[430px] max-w-none select-none md:-bottom-8 md:-left-0 md:w-[480px] lg:w-[600px]"
          />
        </div>
      </div>
    </SectionWrapper>
  )
}
