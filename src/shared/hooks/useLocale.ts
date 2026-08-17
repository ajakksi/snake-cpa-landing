import { useTranslation } from 'react-i18next'

export type SupportedLocale = 'en' | 'ru' | 'ua'

export function useLocale(): SupportedLocale {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? i18n.language

  if (language.startsWith('ru')) return 'ru'
  if (language.startsWith('ua')) return 'ua'
  return 'en'
}
