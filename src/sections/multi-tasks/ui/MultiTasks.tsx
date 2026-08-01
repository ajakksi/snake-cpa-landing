import { useQuery } from '@tanstack/react-query'
import { getTasks } from '@api/endpoints/tasks'
import { getApiErrorMessage } from '@api/errors'
import snakeTasks from '@assets/images/snake-tasks.png'
import { SectionWrapper } from '@components/layout'
import { useLocale } from '@hooks/useLocale'
import { highlightPhrases } from '../config/highlightPhrases'

export default function MultiTasks() {
  const locale = useLocale()
  const { data, error, isPending } = useQuery({
    queryKey: ['tasks', locale],
    queryFn: () => getTasks(locale),
  })

  return (
    <SectionWrapper id="multi-tasks" eyebrow="Multi-tasks" className="relative text-white">
      <div className="flex h-full min-h-0 flex-col">
        <div className="container relative flex flex-1 flex-col pb-12 pt-16 md:pb-6 md:pt-12">
          <div className="relative z-10 grid gap-5 md:gap-5 grid-cols-1 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
            {/* Column 1: Main card with image */}
            <div className="flex flex-col rounded-[16px] md:rounded-[8px] bg-gradient-card overflow-hidden">
              <p className="w-full px-2.5 text-left text-[20px] font-bold leading-[1.2] md:px-[38px] md:pt-[50px] pt-5 flex-shrink-0">
                {error
                  ? getApiErrorMessage(error)
                  : isPending
                    ? 'Loading…'
                    : data?.description.split(highlightPhrases[locale]).map((part, index) =>
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
              <img
                className="pointer-events-none select-none w-full flex-1 object-cover"
                src={snakeTasks}
                alt=""
                aria-hidden="true"
              />
            </div>

            {/* Column 2: 2 big cards */}
            <div className="flex flex-col gap-5 md:gap-6">
              {data?.tiles.slice(0, 2).map((tile, index) => (
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
            <div className="flex flex-col gap-5 md:gap-6">
              {data?.tiles.slice(2, 5).map((tile, index) => (
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
