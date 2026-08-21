import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTasks } from '@api/endpoints/tasks'
import { getApiErrorMessage, isRetryableApiError } from '@api/endpoints/errors'
import snakeTasks from '@assets/images/snake-tasks.png'
import { SectionWrapper } from '@components/layout'
import { Button } from '@components/ui'
import { useLocale } from '@hooks/useLocale'
import { useTranslation } from 'react-i18next'
import { useMultiTasksAnimation } from '../hooks/useMultiTasksAnimation'
import { highlightPhrases } from '../config/highlightPhrases'

// Подстраховка на первый рендер (до JS) — колонка 1 скрыта слева,
// колонки 2/3 — справа. На мобилке (<1024px) не применяется.
// Значения здесь должны совпадать с COL1_OFFSET_X / COL_RIGHT_OFFSET_X.
const COL1_HIDDEN_CLASS = 'lg:opacity-0 lg:-translate-x-[600px]'
const COL_RIGHT_HIDDEN_CLASS = 'lg:opacity-0 lg:translate-x-[600px]'

type MultiTasksProps = {
  playTrigger: number
  resetTrigger: number
}

export default function MultiTasks({ playTrigger, resetTrigger }: MultiTasksProps) {
  const { t } = useTranslation('common')
  const locale = useLocale()
  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: ['tasks', locale],
    queryFn: () => getTasks(locale),
  })

  const col1Ref = useRef<HTMLDivElement>(null)
  const col2Ref = useRef<HTMLDivElement>(null)
  const col3Ref = useRef<HTMLDivElement>(null)

  useMultiTasksAnimation({ col1Ref, col2Ref, col3Ref }, { playTrigger, resetTrigger, isPending })

  return (
    <SectionWrapper id="team" eyebrow="Multi-tasks" className="relative text-white">
      <div className="flex h-full min-h-0 flex-col">
        <div className="container relative flex flex-1 flex-col pb-12 pt-16 md:pb-6 md:pt-12">
          <div className="relative z-10 grid gap-5 md:gap-5 grid-cols-1 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
            {/* Column 1: Main card with image */}
            <div
              ref={col1Ref}
              className={`flex flex-col rounded-[16px] md:rounded-[8px] bg-gradient-card overflow-hidden ${COL1_HIDDEN_CLASS}`}
            >
              {error || isPending || data?.description ? (
                <p className="w-full px-2.5 text-left text-[20px] font-bold leading-[1.2] md:px-[38px] md:pt-[50px] pt-5 flex-shrink-0">
                  {error
                    ? getApiErrorMessage(error)
                    : isPending
                      ? t('loading')
                      : data?.description?.split(highlightPhrases[locale]).map((part, index) =>
                          index === 0 ? (
                            part
                          ) : (
                            <span key={index}>
                              <span className="text-yellow">{highlightPhrases[locale]}</span>
                              {part}
                            </span>
                          ),
                        )}
                </p>
              ) : null}
              {error && isRetryableApiError(error) ? (
                <Button
                  type="button"
                  className="mx-2.5 mt-4 self-start md:mx-[38px]"
                  disabled={isFetching}
                  onClick={() => void refetch()}
                >
                  {t('retry')}
                </Button>
              ) : null}
              <img
                className="pointer-events-none select-none w-full flex-1 object-cover"
                src={snakeTasks}
                alt=""
                aria-hidden="true"
              />
            </div>

            {/* Column 2: 2 big cards */}
            <div ref={col2Ref} className={`flex flex-col gap-5 md:gap-6 ${COL_RIGHT_HIDDEN_CLASS}`}>
              {!isPending &&
                data?.tiles.slice(0, 2).map((tile, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-[16px] md:rounded-[8px] bg-purple px-2.5 py-2.5 md:px-2.5 md:py-2.5 flex flex-col"
                  >
                    <h3 className="text-[18px] sm:text-[22px] md:text-[28px] font-bold leading-[1.2] text-yellow uppercase break-words">
                      {tile.title}
                    </h3>
                    <p className="mt-2.5 text-[20px] font-normal leading-[1.2] opacity-70">
                      {tile.text}
                    </p>
                  </div>
                ))}
            </div>

            {/* Column 3: 3 small cards */}
            <div ref={col3Ref} className={`flex flex-col gap-5 md:gap-6 ${COL_RIGHT_HIDDEN_CLASS}`}>
              {!isPending &&
                data?.tiles.slice(2, 5).map((tile, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-[16px] md:rounded-[8px] bg-purple px-2.5 py-2.5 md:px-2.5 md:py-2.5 flex flex-col"
                  >
                    <h3 className="text-[18px] sm:text-[22px] md:text-[28px] font-bold leading-[1.2] text-yellow uppercase break-words">
                      {tile.title}
                    </h3>
                    <p className="mt-2.5 text-[20px] font-normal leading-[1.2] opacity-70">
                      {tile.text}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
