import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getBenefits } from '@api/endpoints/benefits'
import { getTasks } from '@api/endpoints/tasks'
import { getMultiply } from '@api/endpoints/multiply'

export function usePreloaderReady() {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.split('-')[0] === 'ru' ? 'ru' : 'en'

  const benefitsQuery = useQuery({
    queryKey: ['benefits', locale],
    queryFn: () => getBenefits(locale),
    staleTime: 5 * 60 * 1000,
  })

  const tasksQuery = useQuery({
    queryKey: ['tasks', locale],
    queryFn: () => getTasks(locale),
    staleTime: 5 * 60 * 1000,
  })

  const multiplyQuery = useQuery({
    queryKey: ['multiply', locale],
    queryFn: () => getMultiply(locale),
    staleTime: 5 * 60 * 1000,
  })

  const isReady =
    benefitsQuery.isLoading === false &&
    tasksQuery.isLoading === false &&
    multiplyQuery.isLoading === false

  return isReady
}
