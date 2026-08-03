import { useTranslation } from 'react-i18next'

export type SupportedLocale = 'en' | 'ru'

export function useLocale(): SupportedLocale {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage ?? i18n.language

  return language.startsWith('ru') ? 'ru' : 'en'
}
