import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getMultiply } from '@api/endpoints/multiply'
import { getApiErrorMessage } from '@api/errors'
import ArrowIcon from '@assets/icons/arrow.svg?react'
import snakeWithUs from '@assets/images/snake-with-us.png'
import { SectionWrapper } from '@components/layout'
import { Button3D } from '@components/ui'
import { useLocale } from '@hooks/useLocale'
import { tabKeys } from '../data/tabKeys'
import { resolveTabKey } from '../utils/resolveTabKey'

type JoinUsProps = {
  onJoinClick: () => void
}

export default function JoinUs({ onJoinClick }: JoinUsProps) {
  const { t } = useTranslation(['joinUs', 'common'])
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState(0)

  // Fetch localized content for the tabs.
  const {
    data = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ['multiply', locale],
    queryFn: () => getMultiply(locale),
  })

  // Keep the selected index valid if the API response changes.
  const safeActiveTab = activeTab < data.length || data.length === 0 ? activeTab : 0
  const activeItem = data[safeActiveTab]

  return (
    <SectionWrapper id="join-us" eyebrow="MULTIPLY WITH US" className="relative text-white">
      <div className="flex h-full min-h-0 flex-col">
        <div className="container relative flex flex-1 flex-col pt-8 md:pt-12">
          <div className="relative grid flex-1 content-between gap-8 pb-[50px] md:pb-[100px] lg:grid-cols-[minmax(400px,0.9fr)_minmax(0,1.3fr)] lg:items-start lg:gap-12 lg:pb-28 xl:grid-cols-[520px_minmax(0,720px)] xl:justify-between xl:gap-14">
            {/* Tab controls */}
            <div
              className="relative z-20 flex flex-col items-center gap-4 lg:items-stretch"
              role="tablist"
              aria-label={t('tabsLabel')}
              aria-orientation="vertical"
            >
              {(data.length ? data : tabKeys).map((item, index) => {
                const apiTitle = typeof item === 'string' ? item : item.title
                const tabKey = resolveTabKey(apiTitle)
                const isActive = index === safeActiveTab

                return (
                  <button
                    key={tabKey ?? apiTitle}
                    id={`join-us-tab-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="join-us-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(index)}
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
              id="join-us-panel"
              role="tabpanel"
              aria-labelledby={`join-us-tab-${safeActiveTab}`}
              className="relative z-20 flex min-h-[360px] w-full min-w-0 flex-col items-center justify-center rounded-xl bg-purple px-6 py-10 text-center md:min-h-[410px] md:px-12 lg:h-[550px]"
            >
              {error ? (
                <p className="text-[18px] font-medium">{getApiErrorMessage(error)}</p>
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

          {/* Anchored to the section container so tab content cannot shift it. */}
          <img
            src={snakeWithUs}
            alt=""
            aria-hidden="true"
            className="hidden lg:block pointer-events-none absolute -bottom-4 -left-0 z-10 w-[430px] max-w-none select-none md:-bottom-8 md:-left-0 md:w-[480px] lg:w-[600px]"
          />
        </div>
      </div>
    </SectionWrapper>
  )
}
