import { useQuery } from '@tanstack/react-query'
import { getBenefits } from '@api/endpoints/benefits'
import { getTasks } from '@api/endpoints/tasks'
import { getMultiply } from '@api/endpoints/multiply'
import { useLocale } from './useLocale'

export function usePreloaderReady() {
  const locale = useLocale()

  const benefitsQuery = useQuery({
    queryKey: ['benefits', locale],
    queryFn: () => getBenefits(locale),
  })

  const tasksQuery = useQuery({
    queryKey: ['tasks', locale],
    queryFn: () => getTasks(locale),
  })

  const multiplyQuery = useQuery({
    queryKey: ['multiply', locale],
    queryFn: () => getMultiply(locale),
  })

  const isReady = [benefitsQuery, tasksQuery, multiplyQuery].every(
    (query) => query.isSuccess || query.isError,
  )

  return isReady
}
