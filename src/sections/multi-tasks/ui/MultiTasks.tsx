import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getTasks } from '@api/endpoints/tasks'
import { getApiErrorMessage } from '@api/errors'
import snakeTasks from '@assets/images/snake-tasks.png'
import { SectionWrapper } from '@components/layout'

export default function MultiTasks() {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.split('-')[0] === 'ru' ? 'ru' : 'en'
  const { data, error, isPending } = useQuery({
    queryKey: ['tasks', locale],
    queryFn: () => getTasks(locale),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <SectionWrapper id="multi-tasks" eyebrow="Multi-tasks" className="relative text-white">
      <div className="flex h-full min-h-0 flex-col">
        <div className="container relative flex flex-1 flex-col pb-12 pt-16 md:pb-6 md:pt-12 md:flex-row md:gap-5">
          <div className="flex flex-col gap-5 md:h-[610px] md:flex-row md:gap-5">
            {/* Column 1: Main card with image */}
            <div className="relative z-10 flex flex-col flex-1 md:flex-none md:w-[560px] rounded-[16px] md:rounded-[8px] bg-gradient-card overflow-hidden">
              <p className="w-full px-2.5 text-left text-[20px] font-bold leading-[1.2] md:px-[38px] md:pt-[50px] pt-5 flex-shrink-0">
                {error
                  ? getApiErrorMessage(error)
                  : isPending
                    ? 'Loading…'
                    : data?.description.split('in-house team').map((part, index) =>
                        index === 0 ? (
                          part
                        ) : (
                          <span key={index}>
                            <span className="text-yellow">in-house team</span>
                            {part}
                          </span>
                        ),
                      )}
              </p>
              <img
                className="pointer-events-none select-none w-full flex-1 object-cover"
                src={snakeTasks}
                alt=""
                aria-hidden="true"
              />
            </div>

            {/* Column 2: 2 big cards */}
            <div className="relative z-10 flex flex-col flex-1 md:flex-none md:w-[370px] gap-5 md:gap-6">
              {data?.tiles.slice(0, 2).map((tile, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-[16px] md:rounded-[8px] bg-purple px-2.5 py-2.5 md:px-2.5 md:py-2.5 flex flex-col"
                >
                  <h3 className="text-[28px] font-bold leading-[1.2] text-yellow uppercase">
                    {tile.title}
                  </h3>
                  <p className="mt-2.5 text-[20px] font-normal leading-[1.2] opacity-70">
                    {tile.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Column 3: 3 small cards */}
            <div className="relative z-10 flex flex-col flex-1 md:flex-none md:w-[370px] gap-5 md:gap-6">
              {data?.tiles.slice(2, 5).map((tile, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-[16px] md:rounded-[8px] bg-purple px-2.5 py-2.5 md:px-2.5 md:py-2.5 flex flex-col"
                >
                  <h3 className="text-[28px] font-bold leading-[1.2] text-yellow uppercase">
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
